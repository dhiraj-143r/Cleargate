const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { LOCUS_API_BASE, API_KEY } = require('./locus');

const USE_DUMMY = !API_KEY || process.env.USE_DUMMY === 'true';

/**
 * Create a Locus Checkout session.
 * POST /api/checkout/sessions
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

  try {
    const res = await fetch(`${LOCUS_API_BASE}/api/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        name: title,
        amount: String(parseFloat(amount)),
        successUrl: successUrl || undefined,
        cancelUrl: cancelUrl || undefined,
      }),
    });

    const result = await res.json();

    if (result.success && result.data) {
      return {
        sessionId: result.data.id,
        checkoutUrl: result.data.checkoutUrl,
        status: result.data.status || 'PENDING',
        amount: parseFloat(result.data.amount),
        expiresAt: result.data.expiresAt,
        mode: 'LIVE',
      };
    }

    // Fallback to dummy if API fails
    console.warn('Checkout session creation failed:', result.error || result.message);
    return createDummySession({ amount, title, description, lineItems, metadata });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return createDummySession({ amount, title, description, lineItems, metadata });
  }
}

/**
 * Get checkout session status.
 * GET /api/checkout/sessions/:sessionId
 */
async function getSessionStatus(sessionId) {
  if (USE_DUMMY) {
    return { sessionId, status: 'PENDING', mode: 'DEMO' };
  }

  try {
    const res = await fetch(`${LOCUS_API_BASE}/api/checkout/sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    const result = await res.json();
    if (result.success && result.data) {
      return {
        sessionId: result.data.id,
        status: result.data.status,
        amount: result.data.amount,
        checkoutUrl: result.data.checkoutUrl,
        mode: 'LIVE',
      };
    }

    return { sessionId, status: 'UNKNOWN', mode: 'LIVE', raw: result };
  } catch (error) {
    console.error('Session status error:', error.message);
    return { sessionId, status: 'ERROR', mode: 'LIVE' };
  }
}

/**
 * Create a dummy checkout session for development.
 */
function createDummySession({ amount, title, description, lineItems, metadata }) {
  const sessionId = `demo_cs_${Date.now().toString(36)}`;
  return {
    sessionId,
    checkoutUrl: null,
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
