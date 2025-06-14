// backend/app.js

const express = require('express');         // web server framework
const cors = require('cors');
const http = require('http');
require('dotenv').config();                 // load environment variables
const Sentry = require('@sentry/node');
const invoiceRoutes = require('./routes/invoiceRoutes'); // we'll make this next
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const billingRoutes = require('./routes/billingRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const { autoArchiveOldInvoices, autoDeleteExpiredInvoices } = require('./controllers/invoiceController');
const { initDb } = require('./utils/dbInit');
const { initChat } = require('./utils/chatServer');

const app = express();                      // create the app
const server = http.createServer(app);

console.log('🟡 Starting server...');

Sentry.init({ dsn: process.env.SENTRY_DSN || undefined });
app.use(Sentry.Handlers.requestHandler());

app.use(cors());
app.use(express.json());                    // allow reading JSON data
app.use('/api/invoices', invoiceRoutes);    // route all invoice requests here
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/workflows', workflowRoutes);

app.use(Sentry.Handlers.errorHandler());

(async () => {
  await initDb();

  // Run auto-archive daily
  autoArchiveOldInvoices();
  setInterval(autoArchiveOldInvoices, 24 * 60 * 60 * 1000); // every 24h
  autoDeleteExpiredInvoices();
  setInterval(autoDeleteExpiredInvoices, 24 * 60 * 60 * 1000);

  console.log('🟢 Routes mounted');

  initChat(server);

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
})();
