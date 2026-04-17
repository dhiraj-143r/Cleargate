const express = require('express');
const router = express.Router();
const { getBalance, getTransactions } = require('../services/locus');
const { log, getSystemLog } = require('../services/auditLogger');

const USE_DUMMY = process.env.USE_DUMMY === 'true' || !process.env.LOCUS_API_KEY;

/**
 * GET /api/wallet/balance — Get wallet balance.
 */
router.get('/wallet/balance', async (req, res) => {
  try {
    if (USE_DUMMY) {
      return res.json({
        balance: '15.00',
        currency: 'USDC',
        walletAddress: '0xfa13...3973',
        network: 'Base',
        mode: 'DEMO',
      });
    }

    const data = await getBalance();
    res.json({
      balance: data.balance || '0.00',
      currency: 'USDC',
      walletAddress: data.walletAddress || 'Unknown',
      network: 'Base',
      mode: 'LIVE',
      raw: data,
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.json({
      balance: '0.00', currency: 'USDC',
      walletAddress: 'Error', network: 'Base', mode: 'ERROR',
    });
  }
});

/**
 * GET /api/transactions — Get transaction history.
 */
router.get('/transactions', async (req, res) => {
  try {
    if (USE_DUMMY) {
      return res.json({
        transactions: [
          {
            id: 'tx_001', type: 'VERIFICATION', target: 'vendor@globaltech.xyz',
            amount: '-1.00', status: 'COMPLETED', riskScore: 8,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'tx_002', type: 'VERIFICATION', target: 'contact@shadysite.xyz',
            amount: '-1.00', status: 'COMPLETED', riskScore: 72,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'tx_003', type: 'INVOICE', target: 'client@techcorp.com',
            amount: '+500.00', status: 'PAID', riskScore: null,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'tx_004', type: 'REFUND', target: 'user@example.com',
            amount: '+1.00', status: 'REFUNDED', riskScore: null,
            timestamp: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        mode: 'DEMO',
      });
    }

    const data = await getTransactions();
    res.json({
      transactions: data.transactions || [],
      mode: 'LIVE',
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.json({ transactions: [], mode: 'ERROR' });
  }
});

/**
 * GET /api/audit-log — Get system-level audit log.
 */
router.get('/audit-log', (req, res) => {
  const entries = getSystemLog();
  res.json({
    entries,
    total: entries.length,
  });
});

module.exports = router;
