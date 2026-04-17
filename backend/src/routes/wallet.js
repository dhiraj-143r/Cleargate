const express = require('express');
const router = express.Router();

/**
 * GET /api/wallet/balance — Get wallet balance.
 */
router.get('/wallet/balance', async (req, res) => {
  // Dummy balance for now
  res.json({
    balance: '15.00',
    currency: 'USDC',
    walletAddress: '0xfa133b6bd5a7489f28ea297a96fd5557cb913973',
    network: 'Base',
    mode: 'DEMO',
  });
});

/**
 * GET /api/transactions — Get transaction history.
 */
router.get('/transactions', async (req, res) => {
  // Dummy transactions for now
  res.json({
    transactions: [
      {
        id: 'tx_001',
        type: 'VERIFICATION',
        target: 'vendor@globaltech.xyz',
        amount: '-1.00',
        status: 'COMPLETED',
        riskScore: 8,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'tx_002',
        type: 'VERIFICATION',
        target: 'contact@shadysite.xyz',
        amount: '-1.00',
        status: 'COMPLETED',
        riskScore: 72,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'tx_003',
        type: 'INVOICE',
        target: 'client@techcorp.com',
        amount: '+500.00',
        status: 'PAID',
        riskScore: null,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    mode: 'DEMO',
  });
});

module.exports = router;
