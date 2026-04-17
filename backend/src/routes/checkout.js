const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../store/memoryStore');
const { createCheckoutSession, getSessionStatus } = require('../services/checkoutService');
const { log } = require('../services/auditLogger');

/**
 * POST /api/checkout/create — Create Locus Checkout session.
 * Links a verification report to a payment session.
 */
router.post('/checkout/create', async (req, res) => {
  try {
    const { reportId, amount, description, successUrl, cancelUrl } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Missing required field: amount' });
    }

    // Build line items if we have a report
    let lineItems = [];
    let title = description || 'ClearGate Verification Report';
    const report = reportId ? store.reports.get(reportId) : null;

    if (report) {
      title = `Trust Report: ${report.target}`;
      // Each scan becomes a line item on the receipt
      const scanCosts = report.auditTrail?.entries || [];
      lineItems = scanCosts.map(entry => ({
        name: entry.action,
        amount: entry.costUsdc || 0.005,
        quantity: 1,
      }));

      // Add service fee
      lineItems.push({
        name: 'ClearGate AI Analysis & Report',
        amount: report.costBreakdown?.serviceFee || 0.01,
        quantity: 1,
      });
    }

    // Create the session via Locus Checkout API
    const session = await createCheckoutSession({
      amount: parseFloat(amount),
      title,
      description: title,
      successUrl,
      cancelUrl,
      lineItems,
      metadata: { reportId: reportId || null },
    });

    // Log the action
    log({
      action: 'Checkout Session Created',
      provider: 'Locus Checkout',
      costUsdc: 0,
      reasoning: `Created ${session.mode} checkout session for $${amount} USDC`,
    });

    // Store session with report link
    const sessionRecord = {
      id: session.sessionId,
      reportId: reportId || null,
      amount: parseFloat(amount).toFixed(2),
      title,
      status: session.status || 'PENDING',
      checkoutUrl: session.checkoutUrl,
      createdAt: new Date().toISOString(),
      expiresAt: session.expiresAt,
      mode: session.mode,
    };

    store.sessions.save(session.sessionId, sessionRecord);
    res.json(sessionRecord);

  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({ error: 'Checkout creation failed', message: error.message });
  }
});

/**
 * POST /api/checkout/webhook — Receive payment confirmation from Locus.
 */
router.post('/checkout/webhook', async (req, res) => {
  try {
    const { sessionId, txHash, status, event } = req.body;
    console.log('Checkout webhook received:', { sessionId, status, event });

    const session = store.sessions.get(sessionId);

    if (session) {
      session.status = status || 'PAID';
      session.txHash = txHash || `0x${uuidv4().replace(/-/g, '')}`;
      session.paidAt = new Date().toISOString();
      session.basescanUrl = `https://basescan.org/tx/${session.txHash}`;
      store.sessions.save(sessionId, session);

      // Update linked report status
      if (session.reportId) {
        const report = store.reports.get(session.reportId);
        if (report) {
          report.paymentStatus = 'PAID';
          report.txHash = session.txHash;
          report.basescanUrl = session.basescanUrl;
          store.reports.save(session.reportId, report);
        }
      }

      log({
        action: 'Payment Confirmed',
        provider: 'Locus Checkout',
        costUsdc: parseFloat(session.amount),
        reasoning: `Payment of $${session.amount} USDC confirmed via webhook. TX: ${session.txHash}`,
      });
    }

    res.json({ received: true, processed: !!session });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/checkout/status/:sessionId — Poll payment status.
 */
router.get('/checkout/status/:sessionId', async (req, res) => {
  try {
    const localSession = store.sessions.get(req.params.sessionId);
    if (!localSession) return res.status(404).json({ error: 'Session not found' });

    // If already paid locally, return immediately
    if (localSession.status === 'PAID') {
      return res.json(localSession);
    }

    // Try polling Locus for real-time status
    try {
      const liveStatus = await getSessionStatus(req.params.sessionId);
      if (liveStatus.status === 'PAID' || liveStatus.status === 'completed') {
        localSession.status = 'PAID';
        localSession.txHash = liveStatus.txHash || localSession.txHash;
        localSession.paidAt = new Date().toISOString();
        store.sessions.save(req.params.sessionId, localSession);
      }
    } catch (_) {
      // Polling failed, return local state
    }

    res.json(localSession);

  } catch (error) {
    res.status(500).json({ error: 'Status check failed' });
  }
});

/**
 * POST /api/checkout/simulate-payment — Simulate payment for demo mode.
 */
router.post('/checkout/simulate-payment', (req, res) => {
  const { sessionId } = req.body;
  const session = store.sessions.get(sessionId);

  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'PAID';
  session.txHash = `0xdemo${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
  session.paidAt = new Date().toISOString();
  session.basescanUrl = `https://basescan.org/tx/${session.txHash}`;
  store.sessions.save(sessionId, session);

  // Update linked report
  if (session.reportId) {
    const report = store.reports.get(session.reportId);
    if (report) {
      report.paymentStatus = 'PAID';
      report.txHash = session.txHash;
      report.basescanUrl = session.basescanUrl;
      store.reports.save(session.reportId, report);
    }
  }

  log({
    action: 'Demo Payment Simulated',
    provider: 'ClearGate Demo',
    costUsdc: parseFloat(session.amount),
    reasoning: `Simulated $${session.amount} USDC payment for testing`,
  });

  res.json(session);
});

module.exports = router;
