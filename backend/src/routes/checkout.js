const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../store/memoryStore');

/**
 * POST /api/checkout/create — Create Locus Checkout session.
 * Will use @locus/agent-sdk when credits are ready.
 */
router.post('/checkout/create', async (req, res) => {
  try {
    const { reportId, amount, description } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Missing required field: amount' });
    }

    const sessionId = uuidv4();

    // Dummy checkout session (will use Locus SDK when credits are approved)
    const session = {
      id: sessionId,
      reportId: reportId || null,
      amount: parseFloat(amount).toFixed(2),
      description: description || 'ClearGate Verification Report',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      paymentUrl: null,
      mode: 'DEMO',
    };

    store.sessions.save(sessionId, session);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Checkout creation failed', message: error.message });
  }
});

/**
 * POST /api/checkout/webhook — Receive payment confirmation.
 */
router.post('/checkout/webhook', async (req, res) => {
  try {
    const { sessionId, txHash, status } = req.body;
    const session = store.sessions.get(sessionId);

    if (session) {
      session.status = status || 'PAID';
      session.txHash = txHash || `0x${uuidv4().replace(/-/g, '')}`;
      session.paidAt = new Date().toISOString();
      store.sessions.save(sessionId, session);
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/checkout/status/:sessionId — Poll payment status.
 */
router.get('/checkout/status/:sessionId', (req, res) => {
  const session = store.sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
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

  res.json(session);
});

module.exports = router;
