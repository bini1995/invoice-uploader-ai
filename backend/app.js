// backend/app.js


// Route imports

// Middleware imports
// import tenantContext from './middleware/tenantMiddleware.js';

// Service imports

// Swagger and WebSocket setup

import express from 'express'; // web server framework
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import 'dotenv/config';
import logger from './utils/logger.js';
import * as Sentry from '@sentry/node';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/authRoutes.js';
import exportTemplateRoutes from './routes/exportTemplateRoutes.js';
import brandingRoutes from './routes/brandingRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import vendorPortalRoutes from './routes/vendorPortalRoutes.js';
import workflowRoutes from './routes/documentWorkflowRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import workflowRuleRoutes from './routes/workflowRuleRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import featureRoutes from './routes/featureRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import superiorClaimsRoutes from './routes/superiorClaimsRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import pluginRoutes from './routes/pluginRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import signingRoutes from './routes/signingRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import landingRoutes from './routes/landingRoutes.js';
import validationRoutes from './routes/validationRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import logRoutes from './routes/logRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { auditLog } from './middleware/auditMiddleware.js';
import piiMask from './middleware/piiMask.js';
import { autoDeleteExpiredDocuments } from './controllers/claimController.js';
import { initDb } from './utils/dbInit.js';
import { initChat } from './utils/chatServer.js';
import { loadCorrections } from './utils/parserTrainer.js';
import { loadModel, trainFromCorrections } from './utils/ocrAgent.js';
import { loadSchedules } from './utils/automationScheduler.js';
import { scheduleReports } from './utils/reportScheduler.js';
import { scheduleAnomalyScan } from './utils/anomalyScanner.js';
import buildProblemDetails from './utils/problemDetails.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';
import { parse } from 'url';
import { initDocActivity } from './utils/docActivityServer.js';
import { securityHeaders, corsOptions, requestLogger, errorHandler as securityErrorHandler } from './middleware/security.js';
import passport from './middleware/passport.js';
import tenantContextMiddleware from './middleware/tenantContextMiddleware.js';
import createSessionMiddleware from './middleware/session.js';
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
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://script.hotjar.com", "https://www.googletagmanager.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https://sample-videos.com", "https://*.sample-videos.com"],
      connectSrc: ["'self'", "https://api.openrouter.ai", "https://script.hotjar.com", "https://www.google-analytics.com"],
      frameSrc: ["'self'", "https://www.google.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      camera: ["'none'"],
      microphone: ["'none'"]
    }
  },
}));

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Request parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for rate limiting behind nginx
app.set('trust proxy', 1);

// Session + auth + tenant context
app.use(createSessionMiddleware());
app.use(passport.initialize());
app.use(tenantContextMiddleware);

// Health and metrics endpoints (no auth required)
app.use('/api/health', healthRoutes);
app.use('/metrics', metricsRoutes);

// Auth routes (must be early to avoid middleware conflicts)
app.use('/api/auth', authRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working', timestamp: new Date().toISOString() });
});

// Global rate limiting
app.use(apiLimiter);

// Sentry request handler
app.use(Sentry.Handlers.requestHandler());

// Tenant context middleware - applied only to routes that need it
// app.use(tenantContext); // Removed global application

// API documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Audit logging
app.use(auditLog);

// PII masking
app.use(piiMask);

app.use('/api/claims', authRoutes);
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
app.use('/api/superior', superiorClaimsRoutes); // Superior claims platform
app.use('/api/timeline', timelineRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/signing', signingRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api', landingRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/usage', usageRoutes);

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// Global error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  const problem = buildProblemDetails({
    status: 404,
    title: 'Not Found',
    detail: 'Route not found',
    instance: req.originalUrl
  });
  res.status(404).type('application/problem+json').json(problem);
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
