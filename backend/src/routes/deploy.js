const express = require('express');
const router = express.Router();
const { logEntry } = require('../services/auditLogger');
const { v4: uuidv4 } = require('uuid');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// Use the API key from environment variables
const API_KEY = process.env.LOCUS_API_KEY;
const BETA_API_URL = 'https://beta-api.buildwithlocus.com/v1';

/**
 * Helper to exchange Locus Pay API Key for BuildWithLocus Token
 */
async function getBuildToken() {
  if (!API_KEY) throw new Error('LOCUS_API_KEY is not configured');

  const res = await fetch(`${BETA_API_URL}/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: API_KEY }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(`Token exchange failed: ${data.error || 'Unknown error'}`);
  }
  return data.token;
}

/**
 * POST /api/deploy-enterprise
 * Spins up an isolated instance of ClearGate using BuildWithLocus.
 */
router.post('/deploy-enterprise', async (req, res) => {
  try {
    const { clientName } = req.body;
    if (!clientName) {
      return res.status(400).json({ error: 'clientName is required' });
    }

    // Sanitize client name for project URL (lowercase, alphanumeric, dashes)
    const sanitizedName = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const projectName = `cg-ent-${sanitizedName}-${uuidv4().split('-')[0]}`;

    if (process.env.USE_DUMMY === 'true') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return res.json({
        success: true,
        message: 'Infrastructure provisioning started.',
        project: { id: `proj_mock_${uuidv4().split('-')[0]}` },
        urls: {
          web: `https://svc-mockweb-${uuidv4().split('-')[0]}.buildwithlocus.com`,
          api: `https://svc-mockapi-${uuidv4().split('-')[0]}.buildwithlocus.com`
        }
      });
    }

    // 1. Get auth token
    const token = await getBuildToken();

    // 2. Call from-repo API
    const deployRes = await fetch(`${BETA_API_URL}/projects/from-repo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        repo: 'dhiraj-143r/Cleargate',
        branch: 'main'
      })
    });

    const deployData = await deployRes.json();

    if (!deployRes.ok) {
      throw new Error(`Deployment failed: ${deployData.error || deployData.message || 'Unknown error'}`);
    }

    // Extract the web and api URLs from the response
    const webService = deployData.services?.find(s => s.name === 'web');
    const apiService = deployData.services?.find(s => s.name === 'api');

    // 2.5 Inject environment variables into the newly provisioned API service
    if (apiService?.id) {
      await fetch(`${BETA_API_URL}/variables/service/${apiService.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: {
            "LOCUS_API_KEY": API_KEY,
            "LOCUS_API_BASE": "https://beta-api.paywithlocus.com",
            "USE_DUMMY": "true"
          }
        })
      });
    }

    // 3. Log this action in the audit trail
    logEntry(`sys_${uuidv4()}`, {
      action: 'ENTERPRISE_PORTAL_DEPLOYMENT',
      provider: 'buildwithlocus',
      status: 'SUCCESS',
      result: {
        projectId: deployData.project?.id,
        webUrl: webService?.url,
        apiUrl: apiService?.url
      },
      reasoning: `Provisioned isolated ClearGate infrastructure for client: ${clientName}. Project: ${projectName}.`,
      costUsdc: 0.00,
      durationMs: 1500
    });

    res.json({
      success: true,
      message: 'Infrastructure provisioning started.',
      project: deployData.project,
      urls: {
        web: webService?.url || 'URL pending',
        api: apiService?.url || 'URL pending'
      }
    });

  } catch (error) {
    console.error('Enterprise deployment error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
