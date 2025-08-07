// backend/app.js

const express = require('express');         // web server framework
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
require('dotenv').config();                 // load environment variables
const logger = require('./utils/logger');
const Sentry = require('@sentry/node');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

// Route imports
const authRoutes = require('./routes/authRoutes');
const exportTemplateRoutes = require('./routes/exportTemplateRoutes');
const brandingRoutes = require('./routes/brandingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const vendorPortalRoutes = require('./routes/vendorPortalRoutes');
const workflowRoutes = require('./routes/documentWorkflowRoutes');
const aiRoutes = require('./routes/aiRoutes');
const workflowRuleRoutes = require('./routes/workflowRuleRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const featureRoutes = require('./routes/featureRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const automationRoutes = require('./routes/automationRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const agentRoutes = require('./routes/agentRoutes');
const claimRoutes = require('./routes/claimRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const pluginRoutes = require('./routes/pluginRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const signingRoutes = require('./routes/signingRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const validationRoutes = require('./routes/validationRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const healthRoutes = require('./routes/healthRoutes');
const logRoutes = require('./routes/logRoutes');
const usageRoutes = require('./routes/usageRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Middleware imports
const { auditLog } = require('./middleware/auditMiddleware');
const piiMask = require('./middleware/piiMask');
const tenantContext = require('./middleware/tenantMiddleware');

// Service imports
const { sendApprovalReminders } = require('./controllers/reminderController');
const { autoDeleteExpiredDocuments } = require('./controllers/claimController');
const { initDb } = require('./utils/dbInit');
const { initChat } = require('./utils/chatServer');
const { loadCorrections } = require('./utils/parserTrainer');
const { loadModel, trainFromCorrections } = require('./utils/ocrAgent');
const { loadSchedules } = require('./utils/automationScheduler');
const { scheduleReports } = require('./utils/reportScheduler');
const { scheduleAnomalyScan } = require('./utils/anomalyScanner');

// Swagger and WebSocket setup
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { WebSocketServer } = require('ws');
const { setupWSConnection } = require('@y/websocket-server/utils');
const { parse } = require('url');
const { initDocActivity } = require('./utils/docActivityServer');

const app = express();                      // create the app
const server = http.createServer(app);

logger.info('🟡 Starting server...');

// Initialize Sentry
Sentry.init({ dsn: process.env.SENTRY_DSN || undefined });

// Security middleware (order matters!)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-ID'],
}));

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
app.use(apiLimiter);

// Sentry request handler
app.use(Sentry.Handlers.requestHandler());

// Tenant context middleware
app.use(tenantContext);

// Health and metrics endpoints (no auth required)
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);

// API documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Audit logging
app.use(auditLog);

// PII masking
app.use(piiMask);

// API Routes
function logDeprecatedInvoices(req, res, next) {
  logger.warn(`Deprecated invoices API route used: ${req.originalUrl}`);
  next();
}

app.use('/api/claims', authRoutes);
app.use('/api/invoices', logDeprecatedInvoices, authRoutes); // backwards compat
app.use('/api/:tenantId/invoices', logDeprecatedInvoices, authRoutes);
app.use('/api/:tenantId/export-templates', exportTemplateRoutes);
app.use('/api/:tenantId/logo', brandingRoutes);
app.use('/api/labs/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendor-portal', vendorPortalRoutes);
app.use('/api/document-workflows', workflowRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/workflow-rules', workflowRuleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/labs/automations', automationRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/invoices', logDeprecatedInvoices, claimRoutes); // backwards compat
app.use('/api/:tenantId/invoices', logDeprecatedInvoices, claimRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/signing', signingRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/usage', usageRoutes);

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// Global error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize application
(async () => {
  try {
    // Initialize database
    await initDb();
    logger.info('✅ Database initialized');

    // Load AI models and corrections
    await loadCorrections();
    setInterval(loadCorrections, 60 * 60 * 1000); // refresh corrections hourly
    
    await loadModel();
    await trainFromCorrections();
    setInterval(trainFromCorrections, 6 * 60 * 60 * 1000); // retrain regularly

    // Load automation schedules
    await loadSchedules();
    scheduleReports();
    scheduleAnomalyScan();

    // Setup recurring tasks
    autoDeleteExpiredDocuments();
    setInterval(autoDeleteExpiredDocuments, 24 * 60 * 60 * 1000);
    

    logger.info('🟢 Application initialized successfully');

    // Initialize WebSocket and chat services
    initChat(server);
    initDocActivity(server);

    // WebSocket server setup
    const wss = new WebSocketServer({ noServer: true });
    server.on('upgrade', (request, socket, head) => {
      const { pathname, search } = parse(request.url);
      if (pathname === '/yjs' || pathname.startsWith('/yjs/')) {
        request.url = pathname.slice(4) + (search || '');
        wss.handleUpgrade(request, socket, head, (ws) => {
          setupWSConnection(ws, request);
        });
      }
    });

    // Start server
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
    });

  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
})();
