const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../store/memoryStore');

/**
 * POST /api/invoice/generate — AI generates invoice from description.
 */
router.post('/invoice/generate', async (req, res) => {
  try {
    const { description, amount, currency, clientName, clientEmail, freelancerName } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ error: 'Missing required fields: description, amount' });
    }

    const invoiceId = uuidv4();
    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // AI-generated invoice (dummy for now, will use Gemini when credits are ready)
    const invoice = {
      id: invoiceId,
      invoiceNumber: `CG-${Date.now().toString(36).toUpperCase()}`,
      status: 'DRAFT',
      createdAt: now.toISOString(),
      dueDate: dueDate.toISOString(),
      from: {
        name: freelancerName || 'Your Name',
        platform: 'ClearGate',
      },
      to: {
        name: clientName || 'Client',
        email: clientEmail || '',
      },
      lineItems: [
        {
          description: description,
          quantity: 1,
          unitPrice: parseFloat(amount),
          total: parseFloat(amount),
        },
      ],
      subtotal: parseFloat(amount),
      tax: parseFloat((amount * 0.0).toFixed(2)),
      total: parseFloat(amount),
      totalUsdc: parseFloat(amount),
      currency: currency || 'USD',
      paymentMethod: 'USDC via Locus Checkout',
      terms: 'Payment due within 30 days. Paid via ClearGate — verified, invoiced, and settled on-chain.',
      generatedBy: 'ClearGate AI',
    };

    store.invoices.save(invoiceId, invoice);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Invoice generation failed', message: error.message });
  }
});

/**
 * GET /api/invoice/:id — Get invoice by ID.
 */
router.get('/invoice/:id', (req, res) => {
  const invoice = store.invoices.get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

module.exports = router;
