const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { LOCUS_API_BASE, API_KEY } = require('./locus');

const USE_DUMMY = process.env.USE_DUMMY === 'true' || !process.env.LOCUS_API_KEY;

/**
 * Create a Locus Checkout session.
 * Attempts the real Locus Checkout API first, falls back to demo mode if unavailable.
 *
 * @param {object} opts
 * @param {number}  opts.amount     – amount in USDC
 * @param {string}  opts.title      – product title
 * @param {string}  opts.description – description
 * @param {string}  opts.successUrl – redirect on success
 * @param {string}  opts.cancelUrl  – redirect on cancel
 * @param {Array}   opts.lineItems  – [{name, amount, quantity}]
 * @param {object}  opts.metadata   – any custom metadata
 * @returns {Promise<object>} – { sessionId, checkoutUrl, mode }
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
  // Try real Locus Checkout API first (if API key is available)
  if (!USE_DUMMY && API_KEY) {
    try {
      const res = await fetch(`${LOCUS_API_BASE}/api/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          title,
          description,
          successUrl,
          cancelUrl,
          lineItems: lineItems.length > 0 ? lineItems : [
            { name: title, amount: parseFloat(amount), quantity: 1 },
          ],
          metadata,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[CHECKOUT] Live Locus Checkout session created:', data.sessionId || data.id);
        return {
          sessionId: data.sessionId || data.id || data.session_id,
          checkoutUrl: data.checkoutUrl || data.checkout_url || data.url,
          status: data.status || 'PENDING',
          amount: parseFloat(amount),
          title,
          description,
          lineItems,
          metadata,
          expiresAt: data.expiresAt || data.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          mode: 'LIVE',
        };
      }

      console.warn(`[CHECKOUT] Locus API returned ${res.status}, falling back to demo mode`);
    } catch (err) {
      console.warn('[CHECKOUT] Locus Checkout API unavailable, falling back to demo mode:', err.message);
    }
  }

  // Fallback: demo session (preserves existing behavior exactly)
  return createDummySession({ amount, title, description, lineItems, metadata });
}

/**
 * Get checkout session status.
 * Tries live API first, falls back to local state.
 */
async function getSessionStatus(sessionId) {
  if (USE_DUMMY || sessionId.startsWith('demo_')) {
    return { sessionId, status: 'PENDING', mode: 'DEMO' };
  }

  try {
    const res = await fetch(`${LOCUS_API_BASE}/api/checkout/session/${sessionId}`, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!res.ok) throw new Error(`Session status check failed: ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn('[CHECKOUT] Status check failed, returning PENDING:', err.message);
    return { sessionId, status: 'PENDING', mode: 'DEMO' };
  }
}

/**
 * Create a dummy checkout session for development/demo.
 * Matches the exact behavior of the previous hardcoded implementation.
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
