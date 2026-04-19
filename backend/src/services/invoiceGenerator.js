const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { callWrappedAPI } = require('./locus');

const USE_DUMMY = process.env.USE_DUMMY === 'true' || !process.env.LOCUS_API_KEY;

/**
 * Generate a professional invoice using Gemini AI.
 * Takes a plain-language description and returns structured invoice JSON.
 *
 * @param {object} opts
 * @param {string}  opts.description   – plain text description of work
 * @param {number}  opts.amount        – total amount
 * @param {string}  opts.clientName    – client name
 * @param {string}  opts.clientEmail   – client email
 * @param {string}  opts.freelancerName – your name
 * @param {string}  opts.currency      – USD (converted to USDC at 1:1)
 * @returns {Promise<object>} – structured invoice
 */
async function generateInvoice({
  description,
  amount,
  clientName = 'Client',
  clientEmail = '',
  freelancerName = 'Freelancer',
  currency = 'USD',
}) {
  if (USE_DUMMY) {
    return generateDummyInvoice({ description, amount, clientName, clientEmail, freelancerName, currency });
  }

  // Call Gemini to break down the description into line items
  const prompt = `You are a professional invoice generator. Given the following work description and total amount, generate a JSON invoice with itemized line items.

Work Description: "${description}"
Total Amount: $${amount} ${currency}
From: ${freelancerName}
To: ${clientName} (${clientEmail})

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "lineItems": [
    { "description": "specific task", "quantity": 1, "unitPrice": 100.00, "total": 100.00 }
  ],
  "subtotal": 500.00,
  "tax": 0.00,
  "taxRate": 0,
  "total": 500.00,
  "terms": "Payment due within 30 days.",
  "notes": "Brief professional note about the work"
}

Rules:
- Break the work into 2-5 specific line items
- All line item totals must sum to the subtotal
- subtotal + tax = total
- total must equal $${amount}
- Keep descriptions professional and specific`;

  try {
    const result = await callWrappedAPI('gemini', 'chat', {
      prompt: prompt
    });

    if (result.success && result.data) {
      // Parse the AI response
      let parsed;
      const geminiPayload = result.data.data || result.data;
      const responseText = geminiPayload.candidates?.[0]?.content?.parts?.[0]?.text || 
        geminiPayload.text || geminiPayload.response || JSON.stringify(geminiPayload);

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON in AI response');
      }

      return {
        ...parsed,
        generatedBy: 'Gemini AI via Locus',
        mode: 'LIVE',
        aiCost: 0.005,
      };
    }

    // Fallback to dummy if AI fails
    console.warn('Gemini AI failed, falling back to template:', result.error);
    return generateDummyInvoice({ description, amount, clientName, clientEmail, freelancerName, currency });

  } catch (error) {
    console.error('Invoice AI generation error:', error.message);
    return generateDummyInvoice({ description, amount, clientName, clientEmail, freelancerName, currency });
  }
}

/**
 * Generate a structured invoice without AI (template-based).
 */
function generateDummyInvoice({ description, amount, clientName, clientEmail, freelancerName, currency }) {
  const total = parseFloat(amount);

  // Smart line-item breakdown based on amount
  let lineItems;
  if (total < 100) {
    lineItems = [
      { description, quantity: 1, unitPrice: total, total },
    ];
  } else if (total < 500) {
    const design = Math.round(total * 0.4 * 100) / 100;
    const dev = Math.round(total * 0.5 * 100) / 100;
    const qa = Math.round((total - design - dev) * 100) / 100;
    lineItems = [
      { description: `Design & Planning — ${description}`, quantity: 1, unitPrice: design, total: design },
      { description: `Development & Implementation`, quantity: 1, unitPrice: dev, total: dev },
      { description: `Testing & Quality Assurance`, quantity: 1, unitPrice: qa, total: qa },
    ];
  } else {
    const discovery = Math.round(total * 0.15 * 100) / 100;
    const design = Math.round(total * 0.25 * 100) / 100;
    const dev = Math.round(total * 0.40 * 100) / 100;
    const testing = Math.round(total * 0.10 * 100) / 100;
    const deploy = Math.round((total - discovery - design - dev - testing) * 100) / 100;
    lineItems = [
      { description: `Discovery & Requirements Analysis`, quantity: 1, unitPrice: discovery, total: discovery },
      { description: `UI/UX Design — ${description}`, quantity: 1, unitPrice: design, total: design },
      { description: `Core Development & Integration`, quantity: 1, unitPrice: dev, total: dev },
      { description: `Testing & QA`, quantity: 1, unitPrice: testing, total: testing },
      { description: `Deployment & Documentation`, quantity: 1, unitPrice: deploy, total: deploy },
    ];
  }

  return {
    lineItems,
    subtotal: total,
    tax: 0,
    taxRate: 0,
    total,
    terms: 'Payment due within 30 days. Settled via USDC on Base — instant, verifiable, zero wire fees.',
    notes: `Invoice generated by ClearGate AI for: ${description}`,
    generatedBy: 'ClearGate Template Engine',
    mode: 'DEMO',
    aiCost: 0,
  };
}

module.exports = { generateInvoice };
