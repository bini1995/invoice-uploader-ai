// backend/app.js

const express = require('express');         // web server framework
const cors = require('cors');
const http = require('http');
require('dotenv').config();                 // load environment variables
const Sentry = require('@sentry/node');
const invoiceRoutes = require('./routes/invoiceRoutes'); // we'll make this next
const exportTemplateRoutes = require('./routes/exportTemplateRoutes');
const brandingRoutes = require('./routes/brandingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const vendorPortalRoutes = require('./routes/vendorPortalRoutes');
const billingRoutes = require('./routes/billingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const workflowRuleRoutes = require('./routes/workflowRuleRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const poRoutes = require('./routes/poRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const featureRoutes = require('./routes/featureRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { runRecurringInvoices } = require('./controllers/recurringController');
const { processFailedPayments, sendPaymentReminders } = require('./controllers/paymentController');
const { sendApprovalReminders } = require('./controllers/reminderController');
const { autoArchiveOldInvoices, autoDeleteExpiredInvoices, autoCloseExpiredInvoices } = require('./controllers/invoiceController');
const { initDb } = require('./utils/dbInit');
const { initChat } = require('./utils/chatServer');
const { loadCorrections } = require('./utils/parserTrainer');
const { startEmailSync } = require('./utils/emailSync');

const app = express();                      // create the app
const server = http.createServer(app);

console.log('🟡 Starting server...');

Sentry.init({ dsn: process.env.SENTRY_DSN || undefined });
app.use(Sentry.Handlers.requestHandler());

app.use(cors());
app.use(express.json());                    // allow reading JSON data
app.use('/api/:tenantId/invoices', invoiceRoutes);
app.use('/api/:tenantId/export-templates', exportTemplateRoutes);
app.use('/api/:tenantId/logo', brandingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendor-portal', vendorPortalRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pos', poRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/workflow-rules', workflowRuleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(Sentry.Handlers.errorHandler());

(async () => {
  await initDb();
  await loadCorrections();
  setInterval(loadCorrections, 60 * 60 * 1000); // refresh corrections hourly

  startEmailSync();

  // Run auto-archive daily
  autoArchiveOldInvoices();
  setInterval(autoArchiveOldInvoices, 24 * 60 * 60 * 1000); // every 24h
  autoDeleteExpiredInvoices();
  setInterval(autoDeleteExpiredInvoices, 24 * 60 * 60 * 1000);
  autoCloseExpiredInvoices();
  setInterval(autoCloseExpiredInvoices, 24 * 60 * 60 * 1000);
  runRecurringInvoices();
  setInterval(runRecurringInvoices, 24 * 60 * 60 * 1000);
  processFailedPayments();
  setInterval(processFailedPayments, 60 * 60 * 1000);
  sendPaymentReminders();
  setInterval(sendPaymentReminders, 24 * 60 * 60 * 1000);
  sendApprovalReminders();
  setInterval(sendApprovalReminders, 24 * 60 * 60 * 1000);

  console.log('🟢 Routes mounted');

  initChat(server);

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
})();
