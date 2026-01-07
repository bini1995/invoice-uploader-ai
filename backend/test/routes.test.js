import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
process.env.JWT_SECRET = 'testsecret-1234567890123456789012';
process.env.JWT_REFRESH_SECRET = 'refreshsecret-12345678901234567890';
process.env.OPS_TOKEN = 'secret';

jest.unstable_mockModule('../config/db.js', () => ({ default: { query: jest.fn() } }));

const { default: db } = await import('../config/db.js');
const { default: authRoutes } = await import('../routes/authRoutes.js');
const { authMiddleware, authorizeRoles } = await import('../controllers/userController.js');


const uploadRouter = express.Router();
uploadRouter.post('/api/claims/upload', authMiddleware, (req, res) => res.json({ ok: true }));
const anomalyRouter = express.Router();
anomalyRouter.get('/api/:tenantId/claims/anomalies', authMiddleware, (req, res) => res.json({ anomalies: [] }));
const signingRouter = express.Router();
signingRouter.post('/api/signing/1/start', authMiddleware, (req, res) => res.json({ url: 'ok' }));
const entityRouter = express.Router();
entityRouter.get('/api/claims/totals-by-entity', authMiddleware, (req, res) => res.json({ totals: [] }));
const fieldRouter = express.Router();
fieldRouter.post('/api/claims/1/extract-fields', authMiddleware, (req, res) => res.json({ ok: true }));
const feedbackRouter = express.Router();
feedbackRouter.post('/api/claims/1/feedback', authMiddleware, (req, res) => res.json({ ok: true }));
feedbackRouter.get('/api/claims/1/feedback', authMiddleware, (req, res) => res.json({}));
feedbackRouter.get('/api/claims/1/review-notes', authMiddleware, (req, res) => res.json({ notes: [] }));
feedbackRouter.get('/api/:tenantId/invoices/1/review-notes', authMiddleware, (req, res) => res.json({ notes: [] }));
feedbackRouter.get('/api/:tenantId/claims/1/review-notes', authMiddleware, (req, res) => res.json({ notes: [] }));
const analyticsRouter = express.Router();
analyticsRouter.get('/api/analytics/claims', authMiddleware, (req, res) => res.json({}));
analyticsRouter.get('/api/analytics/claims/fraud', authMiddleware, (req, res) => res.json({}));
const workflowRouter = express.Router();
workflowRouter.get('/api/workflows', authMiddleware, authorizeRoles('admin'), (req, res) => res.json({ templates: [] }));

const SUNSET_DATE = new Date('Sun, 31 Aug 2025 00:00:00 GMT');
const legacyUsage = new Map();
function deprecatedInvoicesNotice(req, res, next) {
  if (req.originalUrl.startsWith('/api/claims')) return next();
  res.set(
    'Link',
    '</docs/INVOICE_API_DEPRECATION.md>; rel="deprecation", </docs/INVOICE_API_DEPRECATION.md#timeline>; rel="sunset"'
  );
  const now = Date.now();
  const key = `${req.params.tenantId || 'none'}:${(req.user && req.user.id) || 'anon'}`;
  const hits = legacyUsage.get(key) || [];
  hits.push(now);
  legacyUsage.set(key, hits);
  if (now >= SUNSET_DATE.getTime()) {
    return res.status(410).type('application/problem+json').send({
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

const invoiceRouter = express.Router();
invoiceRouter.get('/', (req, res) => res.json({ ok: true }));
invoiceRouter.post('/', (req, res) => res.json({ ok: true }));
const tenantInvoiceRouter = express.Router();
tenantInvoiceRouter.get('/', (req, res) => res.json({ ok: true }));
tenantInvoiceRouter.post('/', (req, res) => res.json({ ok: true }));

const app = express();
app.use(express.json());
app.use('/api/claims', authRoutes);
app.use('/api/invoices', deprecatedInvoicesNotice);
app.use('/api/invoices', invoiceRouter);
app.use('/api/invoices', authRoutes);
app.use('/api/:tenantId/invoices', deprecatedInvoicesNotice);
app.use('/api/:tenantId/invoices', tenantInvoiceRouter);
app.use(uploadRouter);
app.use(anomalyRouter);
app.use(signingRouter);
app.use(entityRouter);
app.use(fieldRouter);
app.use(feedbackRouter);
app.use(analyticsRouter);
app.use(workflowRouter);

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
  res.json({ hits: paginated, page, per_page: perPage, total: hits.length, alert });
});


beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date('2024-06-01'));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Auth and documents', () => {
  test('login returns token', async () => {
    const hash = await bcrypt.hash('pass', 10);
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'user', password_hash: hash, role: 'admin' }] });
    const res = await request(app).post('/api/claims/login').send({ username: 'user', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('invoice alias login returns token', async () => {
    const hash = await bcrypt.hash('pass', 10);
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'user', password_hash: hash, role: 'admin' }] });
    const res = await request(app).post('/api/invoices/login').send({ username: 'user', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('upload requires auth', async () => {
    const res = await request(app).post('/api/claims/upload');
    expect(res.statusCode).toBe(401);
  });

  test('anomaly route requires auth', async () => {
    const res = await request(app).get('/api/1/claims/anomalies');
    expect(res.statusCode).toBe(401);
  });

  test('entity totals route requires auth', async () => {
    const res = await request(app).get('/api/claims/totals-by-entity');
    expect(res.statusCode).toBe(401);
  });

  test('signing route requires auth', async () => {
    const res = await request(app).post('/api/signing/1/start');
    expect(res.statusCode).toBe(401);
  });

  test('claim field extraction requires auth', async () => {
    const res = await request(app).post('/api/claims/1/extract-fields');
    expect(res.statusCode).toBe(401);
  });

  test('feedback routes require auth', async () => {
    const res1 = await request(app).post('/api/claims/1/feedback');
    expect(res1.statusCode).toBe(401);
    const res2 = await request(app).get('/api/claims/1/feedback');
    expect(res2.statusCode).toBe(401);
    const res3 = await request(app).get('/api/claims/1/review-notes');
    expect(res3.statusCode).toBe(401);
    const res4 = await request(app)
      .get('/api/default/invoices/1/review-notes')
      .redirects(1);
    expect(res4.statusCode).toBe(401);
  });

  test('claim analytics requires auth', async () => {
    const res = await request(app).get('/api/analytics/claims');
    expect(res.statusCode).toBe(401);
  });

  test('claim fraud detection requires auth', async () => {
    const res = await request(app).get('/api/analytics/claims/fraud');
    expect(res.statusCode).toBe(401);
  });

  test('workflow templates require auth', async () => {
    const res = await request(app).get('/api/workflows?type=insurance');
    expect(res.statusCode).toBe(401);
  });

  test('deprecated GET /api/invoices redirects with warning headers', async () => {
    const res = await request(app).get('/api/invoices').redirects(0);
    expect(res.statusCode).toBe(308);
    expect(res.headers.location).toBe('/api/claims');
    const headers = res.headers;
    expect(headers.deprecation).toBe('true');
    expect(headers.sunset).toBe(SUNSET_DATE.toUTCString());
    expect(headers.warning).toBe('299 - "Deprecated API: use /api/claims"');
    expect(headers.link).toContain('/docs/INVOICE_API_DEPRECATION.md');
    expect(headers['cache-control']).toContain('max-age=60');
  });

  test('deprecated tenant GET invoices redirects with warning headers', async () => {
    const res = await request(app).get('/api/default/invoices').redirects(0);
    expect(res.statusCode).toBe(308);
    expect(res.headers.location).toBe('/api/default/claims');
    const headers = res.headers;
    expect(headers.deprecation).toBe('true');
    expect(headers.sunset).toBe(SUNSET_DATE.toUTCString());
    expect(headers.warning).toBe('299 - "Deprecated API: use /api/claims"');
    expect(headers.link).toContain('/docs/INVOICE_API_DEPRECATION.md');
    expect(headers['cache-control']).toContain('max-age=60');
  });

  test('deprecated POST /api/invoices still works with warning headers', async () => {
    const res = await request(app).post('/api/invoices').send({});
    expect(res.statusCode).toBe(200);
    const headers = res.headers;
    expect(headers.deprecation).toBe('true');
    expect(headers.sunset).toBe(SUNSET_DATE.toUTCString());
    expect(headers.warning).toBe('299 - "Deprecated API: use /api/claims"');
    expect(headers.link).toContain('/docs/INVOICE_API_DEPRECATION.md');
  });

  test('redirect preserves query params', async () => {
    const res = await request(app).get('/api/invoices?foo=bar').redirects(0);
    expect(res.statusCode).toBe(308);
    expect(res.headers.location).toBe('/api/claims?foo=bar');
  });

  test('sunset boundary switches to 410 with problem body', async () => {
    jest.setSystemTime(new Date('2025-08-30T23:59:59Z'));
    const pre = await request(app).get('/api/invoices').redirects(0);
    expect(pre.statusCode).toBe(308);
    jest.setSystemTime(new Date('2025-08-31T00:00:00Z'));
    const res = await request(app).get('/api/invoices').redirects(0);
    expect(res.statusCode).toBe(410);
    expect(res.body).toEqual({
      type: '/docs/INVOICE_API_DEPRECATION.md',
      title: 'Invoice API removed',
      status: 410,
      detail: 'The Invoice API has been removed. Use /api/claims instead.',
      instance: '/api/invoices',
      links: { deprecation: '/docs/INVOICE_API_DEPRECATION.md' },
    });
    jest.setSystemTime(new Date('2024-06-01'));
  });

  test('ops endpoint reports legacy invoice hits with auth and pagination', async () => {
    await request(app).get('/api/invoices').redirects(0);
    const res = await request(app)
      .get('/ops/legacy-invoices?page=1&per_page=1')
      .set('x-ops-token', 'secret');
    expect(res.statusCode).toBe(200);
    expect(res.body.hits.length).toBe(1);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('alert');
  });
});
