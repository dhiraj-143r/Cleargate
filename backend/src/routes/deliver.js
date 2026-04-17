const express = require('express');
const router = express.Router();
const store = require('../store/memoryStore');
const { sendAgentMail } = require('../services/locus');
const { log } = require('../services/auditLogger');

const USE_DUMMY = process.env.USE_DUMMY === 'true' || !process.env.LOCUS_API_KEY;

/**
 * POST /api/deliver — Send trust report via AgentMail.
 */
router.post('/deliver', async (req, res) => {
  try {
    const { reportId, email } = req.body;

    if (!reportId || !email) {
      return res.status(400).json({ error: 'Missing required fields: reportId, email' });
    }

    const report = store.reports.get(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const subject = `ClearGate Trust Report — ${report.target}`;
    const body = formatReportEmail(report);

    let delivery;

    if (USE_DUMMY) {
      delivery = {
        id: `del_${Date.now().toString(36)}`,
        reportId,
        email,
        status: 'SENT',
        sentAt: new Date().toISOString(),
        subject,
        mode: 'DEMO',
        cost: 0,
      };
    } else {
      try {
        const result = await sendAgentMail(email, subject, body);
        delivery = {
          id: result.id || `del_${Date.now().toString(36)}`,
          reportId,
          email,
          status: 'SENT',
          sentAt: new Date().toISOString(),
          subject,
          mode: 'LIVE',
          cost: 0.01,
          raw: result,
        };
      } catch (mailErr) {
        console.error('AgentMail error:', mailErr.message);
        delivery = {
          id: `del_${Date.now().toString(36)}`,
          reportId,
          email,
          status: 'FAILED',
          error: mailErr.message,
          sentAt: new Date().toISOString(),
          subject,
          mode: 'LIVE',
        };
      }
    }

    // Mark report as delivered
    report.deliveredTo = email;
    report.deliveryStatus = delivery.status;
    report.deliveredAt = delivery.sentAt;
    store.reports.save(reportId, report);

    log({
      action: 'Report Delivered',
      provider: 'AgentMail',
      costUsdc: delivery.cost || 0,
      reasoning: `${delivery.mode} delivery of trust report to ${email}. Status: ${delivery.status}`,
    });

    res.json(delivery);

  } catch (error) {
    console.error('Delivery error:', error);
    res.status(500).json({ error: 'Delivery failed', message: error.message });
  }
});

/**
 * POST /api/refund — Refund via email escrow.
 */
router.post('/refund', async (req, res) => {
  try {
    const { reportId, email, amount, reason } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: 'Missing required fields: email, amount' });
    }

    if (USE_DUMMY) {
      const refund = {
        id: `ref_${Date.now().toString(36)}`,
        reportId: reportId || null,
        email,
        amount: parseFloat(amount).toFixed(2),
        reason: reason || 'Verification failed — automatic refund',
        status: 'SENT',
        sentAt: new Date().toISOString(),
        mode: 'DEMO',
      };

      log({
        action: 'Refund Issued',
        provider: 'Email Escrow',
        costUsdc: parseFloat(amount),
        reasoning: `Demo refund of $${amount} to ${email}. Reason: ${refund.reason}`,
      });

      return res.json(refund);
    }

    // Live: use email escrow
    const { sendEmailEscrow } = require('../services/locus');
    const result = await sendEmailEscrow(email, parseFloat(amount), reason || 'ClearGate refund');

    log({
      action: 'Refund Issued',
      provider: 'Email Escrow',
      costUsdc: parseFloat(amount),
      reasoning: `Live refund of $${amount} to ${email} via email escrow`,
    });

    res.json({
      id: result.id || `ref_${Date.now().toString(36)}`,
      email,
      amount: parseFloat(amount).toFixed(2),
      status: 'SENT',
      sentAt: new Date().toISOString(),
      mode: 'LIVE',
      raw: result,
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Refund failed', message: error.message });
  }
});

/**
 * Format trust report as email body.
 */
function formatReportEmail(report) {
  const scans = Object.values(report.scans || {})
    .map(s => `• ${s.provider}: ${s.status} — ${s.description}`)
    .join('\n');

  return `
ClearGate Trust Report
━━━━━━━━━━━━━━━━━━━━

Target: ${report.target}
Date: ${new Date(report.createdAt).toLocaleString()}
Risk Score: ${report.assessment.riskScore}/100 (${report.assessment.riskLevel})

AI Assessment
─────────────
${report.assessment.summary}

Recommendation: ${report.assessment.recommendation}

Scan Results
────────────
${scans}

Cost Breakdown
──────────────
API Scans: $${report.costBreakdown?.scans?.toFixed(4) || '0.0000'}
Service Fee: $${report.costBreakdown?.serviceFee?.toFixed(4) || '0.0000'}
Total: $${report.costBreakdown?.total?.toFixed(4) || '0.0000'} USDC

━━━━━━━━━━━━━━━━━━━━
Powered by ClearGate — Verify. Invoice. Pay. All Clear.
https://cleargate.app
`.trim();
}

module.exports = router;
