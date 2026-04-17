require('dotenv').config();
const express = require('express');
const cors = require('cors');

const healthRoutes = require('./src/routes/health');
const verifyRoutes = require('./src/routes/verify');
const invoiceRoutes = require('./src/routes/invoice');
const checkoutRoutes = require('./src/routes/checkout');
const deliverRoutes = require('./src/routes/deliver');
const walletRoutes = require('./src/routes/wallet');
const reportsRoutes = require('./src/routes/reports');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routes
app.use('/api', healthRoutes);
app.use('/api', verifyRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', deliverRoutes);
app.use('/api', walletRoutes);
app.use('/api', reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔒 ClearGate API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
