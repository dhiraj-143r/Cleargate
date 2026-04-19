const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { LOCUS_API_BASE, API_KEY } = require('./locus');

const USE_DUMMY = process.env.USE_DUMMY === 'true' || !process.env.LOCUS_API_KEY;

/**
 * Create a Locus Checkout session.
 * Docs: POST /api/checkout/session
 *
 * @param {object} opts
 * @param {number}  opts.amount     – amount in USDC
 * @param {string}  opts.title      – product title
 * @param {string}  opts.description – description
 * @param {string}  opts.successUrl – redirect on success
 * @param {string}  opts.cancelUrl  – redirect on cancel
 * @param {Array}   opts.lineItems  – [{name, amount, quantity}]
 * @param {object}  opts.metadata   – any custom metadata
 * @returns {Promise<object>} – { sessionId, checkoutUrl }
 */
async function createCheckoutSession({
  amount,
  title = 'ClearGate Verification',
  description = 'AI-powered trust report with 7-point security scan',
  successUrl,
  cancelUrl,
  lineItems = [],
  metadata = {},
}) {
  if (USE_DUMMY) {
    return createDummySession({ amount, title, description, lineItems, metadata });
  }

  const res = await fetch(`${LOCUS_API_BASE}/api/checkout/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      name: title,
      description,
      amount: parseFloat(amount),
      currency: 'USDC',
      successUrl: successUrl || undefined,
      cancelUrl: cancelUrl || undefined,
      lineItems: lineItems.length > 0 ? lineItems : [
        { name: title, amount: parseFloat(amount), quantity: 1 },
      ],
      metadata,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Checkout session creation failed: ${res.status} – ${err}`);
  }

  const data = await res.json();

  return {
    sessionId: data.id || data.sessionId,
    checkoutUrl: data.url || data.checkoutUrl,
    status: data.status || 'PENDING',
    amount: parseFloat(amount),
    expiresAt: data.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    raw: data,
    mode: 'LIVE',
  };
}

/**
 * Get checkout session status.
 */
async function getSessionStatus(sessionId) {
  if (USE_DUMMY) {
    return { sessionId, status: 'PENDING', mode: 'DEMO' };
  }

  const res = await fetch(`${LOCUS_API_BASE}/api/checkout/session/${sessionId}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) throw new Error(`Session status check failed: ${res.status}`);
  return res.json();
}

/**
 * Create a dummy checkout session for development.
 */
function createDummySession({ amount, title, description, lineItems, metadata }) {
  const sessionId = `demo_cs_${Date.now().toString(36)}`;
  return {
    sessionId,
    checkoutUrl: null, // will be handled client-side
    status: 'PENDING',
    amount: parseFloat(amount),
    title,
    description,
    lineItems: lineItems.length > 0 ? lineItems : [
      { name: title, amount: parseFloat(amount), quantity: 1 },
    ],
    metadata,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    mode: 'DEMO',
  };
}

module.exports = {
  createCheckoutSession,
  getSessionStatus,
};
