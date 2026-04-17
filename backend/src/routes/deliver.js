const express = require('express');
const router = express.Router();
const store = require('../store/memoryStore');

/**
 * POST /api/deliver — Send report via AgentMail.
 */
router.post('/deliver', async (req, res) => {
  try {
    const { reportId, email } = req.body;

    if (!reportId || !email) {
      return res.status(400).json({ error: 'Missing required fields: reportId, email' });
    }

    const report = store.reports.get(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    // Dummy delivery for now (will use AgentMail when credits are approved)
    const delivery = {
      id: `del_${Date.now()}`,
      reportId,
      email,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      subject: `ClearGate Trust Report — ${report.target}`,
      mode: 'DEMO',
    };

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: 'Delivery failed', message: error.message });
  }
});

module.exports = router;
