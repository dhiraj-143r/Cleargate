const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const LOCUS_API_BASE = 'https://beta-api.paywithlocus.com';
const API_KEY = process.env.LOCUS_API_KEY || '';

/**
 * Call a Locus Wrapped API endpoint.
 * @param {string} provider - e.g. 'ofac', 'virustotal', 'hunter'
 * @param {string} endpoint - e.g. 'search', 'scan-url', 'verify-email'
 * @param {object} body - request payload
 * @returns {Promise<object>} - { data, cost, duration }
 */
async function callWrappedAPI(provider, endpoint, body) {
  const startTime = Date.now();
  const url = `${LOCUS_API_BASE}/api/wrapped/${provider}/${endpoint}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const duration = Date.now() - startTime;

    return {
      success: res.ok,
      status: res.status,
      data,
      duration,
      provider,
      endpoint,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      data: null,
      error: error.message,
      duration: Date.now() - startTime,
      provider,
      endpoint,
    };
  }
}

/**
 * Get wallet balance.
 */
async function getBalance() {
  const res = await fetch(`${LOCUS_API_BASE}/api/pay/balance`, {
    headers: { 'x-api-key': API_KEY },
  });
  return res.json();
}

/**
 * Get transaction history.
 */
async function getTransactions() {
  const res = await fetch(`${LOCUS_API_BASE}/api/pay/transactions`, {
    headers: { 'x-api-key': API_KEY },
  });
  return res.json();
}

/**
 * Send USDC via email escrow (for refunds).
 */
async function sendEmailEscrow(email, amount, memo) {
  const res = await fetch(`${LOCUS_API_BASE}/api/pay/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ email, amount, memo }),
  });
  return res.json();
}

/**
 * Send AgentMail message.
 */
async function sendAgentMail(to, subject, body) {
  const res = await fetch(`${LOCUS_API_BASE}/api/x402/agentmail-send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ to, subject, body }),
  });
  return res.json();
}

module.exports = {
  callWrappedAPI,
  getBalance,
  getTransactions,
  sendEmailEscrow,
  sendAgentMail,
  LOCUS_API_BASE,
  API_KEY,
};
