const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../store/memoryStore');
const { generateInvoice } = require('../services/invoiceGenerator');
const { createCheckoutSession } = require('../services/checkoutService');
const { log } = require('../services/auditLogger');

/**
 * POST /api/invoice/generate — AI generates invoice from description.
 */
router.post('/invoice/generate', async (req, res) => {
  try {
    const { description, amount, currency, clientName, clientEmail, freelancerName } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ error: 'Missing required fields: description, amount' });
    }

    // Generate invoice using AI (or template fallback)
    const aiResult = await generateInvoice({
      description,
      amount: parseFloat(amount),
      clientName,
      clientEmail,
      freelancerName,
      currency,
    });

    const invoiceId = uuidv4();
    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

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
      lineItems: aiResult.lineItems,
      subtotal: aiResult.subtotal,
      tax: aiResult.tax || 0,
      taxRate: aiResult.taxRate || 0,
      total: aiResult.total,
      totalUsdc: aiResult.total,
      currency: currency || 'USD',
      paymentMethod: 'USDC via Locus Checkout',
      terms: aiResult.terms,
      notes: aiResult.notes || '',
      generatedBy: aiResult.generatedBy,
      aiCost: aiResult.aiCost || 0,
      mode: aiResult.mode,
    };

    store.invoices.save(invoiceId, invoice);

    log({
      action: 'Invoice Generated',
      provider: aiResult.generatedBy,
      costUsdc: aiResult.aiCost || 0,
      reasoning: `Generated invoice #${invoice.invoiceNumber} for $${amount} — ${aiResult.lineItems.length} line items`,
    });

    res.json(invoice);

  } catch (error) {
    console.error('Invoice generation error:', error);
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

/**
 * GET /api/invoices — List all invoices.
 */
router.get('/invoices', (req, res) => {
  const invoices = store.invoices.getAll();
  res.json({ invoices, total: invoices.length });
});

/**
 * POST /api/invoice/:id/pay — Create checkout session for an invoice.
 */
router.post('/invoice/:id/pay', async (req, res) => {
  try {
    const invoice = store.invoices.get(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const { successUrl, cancelUrl } = req.body;

    // Create checkout session from invoice
    const session = await createCheckoutSession({
      amount: invoice.totalUsdc,
      title: `Invoice ${invoice.invoiceNumber}`,
      description: `Payment for ${invoice.to.name} — ${invoice.lineItems.length} items`,
      successUrl,
      cancelUrl,
      lineItems: invoice.lineItems.map(item => ({
        name: item.description,
        amount: item.total,
        quantity: item.quantity || 1,
      })),
      metadata: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
    });

    // Update invoice status
    invoice.status = 'SENT';
    invoice.checkoutSessionId = session.sessionId;
    invoice.checkoutUrl = session.checkoutUrl;
    store.invoices.save(invoice.id, invoice);

    // Store the session so the checkout page can find it
    store.sessions.save(session.sessionId, {
      id: session.sessionId,
      invoiceId: invoice.id,
      amount: invoice.totalUsdc,
      title: `Invoice ${invoice.invoiceNumber}`,
      status: session.status || 'PENDING',
      checkoutUrl: session.checkoutUrl,
      createdAt: new Date().toISOString(),
      expiresAt: session.expiresAt,
      mode: session.mode,
    });

    log({
      action: 'Invoice Payment Initiated',
      provider: 'Locus Checkout',
      costUsdc: 0,
      reasoning: `Created checkout for invoice #${invoice.invoiceNumber}, $${invoice.totalUsdc} USDC`,
    });

    res.json({
      invoice,
      checkout: {
        sessionId: session.sessionId,
        checkoutUrl: session.checkoutUrl,
        mode: session.mode,
      },
    });

  } catch (error) {
    console.error('Invoice payment error:', error);
    res.status(500).json({ error: 'Payment initiation failed', message: error.message });
  }
});

module.exports = router;
