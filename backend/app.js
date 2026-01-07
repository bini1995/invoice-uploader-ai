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
import crypto from 'crypto';
import validationRoutes from './routes/validationRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import logRoutes from './routes/logRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import { legacyInvoiceApiHitCounter } from './metrics.js';
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
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';
import { parse } from 'url';
import { initDocActivity } from './utils/docActivityServer.js';
import { securityHeaders, corsOptions, requestLogger, errorHandler as securityErrorHandler } from './middleware/security.js';
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
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-ID'],
    exposedHeaders: ['Deprecation', 'Sunset', 'Warning', 'Link', 'X-Request-Id'],
  })
);
app.options(/.*/, cors());

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting behind nginx
app.set('trust proxy', 1);

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

// API Routes
const SUNSET_DATE = new Date('Sun, 31 Aug 2025 00:00:00 GMT');
const REMOVAL_TENANTS = (process.env.INVOICE_REMOVAL_TENANTS || '')
  .split(',')
  .filter(Boolean);
const REMOVE_INVOICES = process.env.INVOICE_REMOVAL_ENABLED === 'true';
const legacyUsage = new Map();

function deprecatedInvoicesNotice(req, res, next) {
  if (req.originalUrl.startsWith('/api/claims')) return next();

  const tenant = req.params.tenantId || req.tenantId || null;
  const userId = (req.user && req.user.id) || null;

  const bucket = id => {
    if (!id) return 'none';
    const hash = crypto.createHash('sha256').update(String(id)).digest('hex');
    return 'b' + (parseInt(hash.slice(0, 8), 16) % 1024);
  };
  const tenantLabel = bucket(tenant);
  const userLabel = bucket(userId || 'anon');
  const traceId = req.headers['x-trace-id'];
  legacyInvoiceApiHitCounter.inc({ tenant: tenantLabel, user_id: userLabel }, 1, undefined, traceId ? { trace_id: traceId } : undefined);

  logger.warn('Deprecated invoices API route used', {
    event: 'legacy_api_hit',
    route: req.originalUrl,
    tenant,
    user_id: userId,
  });

  const key = `${tenant || 'none'}:${userId || 'anon'}`;
  const hits = legacyUsage.get(key) || [];
  hits.push(Date.now());
  legacyUsage.set(key, hits);

  res.set(
    'Link',
    '</docs/INVOICE_API_DEPRECATION.md>; rel="deprecation", </docs/INVOICE_API_DEPRECATION.md#timeline>; rel="sunset"'
  );

  const now = Date.now();
  if (REMOVAL_TENANTS.includes(tenant) || (REMOVE_INVOICES && !tenant) || now >= SUNSET_DATE.getTime()) {
    return res
      .status(410)
      .type('application/problem+json')
      .send({
        type: '/docs/INVOICE_API_DEPRECATION.md',
        title: 'Invoice API removed',
        status: 410,
        detail: 'The Invoice API has been removed. Use /api/claims instead.',
        instance: req.originalUrl,
        links: { deprecation: '/docs/INVOICE_API_DEPRECATION.md' },
      });
  }

  res.set('Deprecation', 'true');
  res.set('Sunset', SUNSET_DATE.toUTCString());
  res.set('Warning', '299 - "Deprecated API: use /api/claims"');

  if (req.method === 'GET') {
    const target = req.originalUrl.replace('/invoices', '/claims');
    res.set('Cache-Control', 'public, max-age=60');
    return res.redirect(308, target);
  }

  next();
}

app.use('/api/invoices', deprecatedInvoicesNotice);
app.use('/api/:tenantId/invoices', deprecatedInvoicesNotice);

app.use('/api/claims', authRoutes);
app.use('/api/invoices', authRoutes); // backwards compat login
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
app.use('/api/invoices', claimRoutes); // backwards compat
// app.use('/api/:tenantId/invoices', tenantContext, claimRoutes);
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

app.get('/ops/legacy-invoices', (req, res) => {
  if (process.env.OPS_TOKEN && req.headers['x-ops-token'] !== process.env.OPS_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const now = Date.now();
  const seven = now - 7 * 24 * 60 * 60 * 1000;
  const thirty = now - 30 * 24 * 60 * 60 * 1000;
  const hits = [];
  for (const [key, timestamps] of legacyUsage.entries()) {
    const [tenant, user_id] = key.split(':');
    const recent = timestamps.filter(t => t >= thirty);
    legacyUsage.set(key, recent);
    hits.push({
      tenant: tenant === 'none' ? null : tenant,
      user_id: user_id === 'anon' ? null : user_id,
      last7: recent.filter(t => t >= seven).length,
      last30: recent.length,
    });
  }

  const page = parseInt(req.query.page || '1', 10);
  const perPage = parseInt(req.query.per_page || '50', 10);
  const start = (page - 1) * perPage;
  const paginated = hits.slice(start, start + perPage);
  const alert = now >= SUNSET_DATE.getTime() && hits.some(h => h.last30 > 0);
  if (alert) {
    const count = hits.reduce((sum, h) => sum + h.last30, 0);
    logger.error('Legacy invoice hits after sunset', { count });
  }

  res.json({ hits: paginated, page, per_page: perPage, total: hits.length, alert });
});

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// Global error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
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
