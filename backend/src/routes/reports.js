const express = require('express');
const router = express.Router();
const store = require('../store/memoryStore');

/**
 * GET /api/reports/:id — Get a saved verification report.
 */
router.get('/reports/:id', (req, res) => {
  const report = store.reports.get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
});

/**
 * GET /api/reports — Get all reports.
 */
router.get('/reports', (req, res) => {
  const reports = store.reports.getAll();
  res.json({ reports, total: reports.length });
});

module.exports = router;
