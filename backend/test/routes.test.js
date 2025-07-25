process.env.JWT_SECRET = 'testsecret';
process.env.JWT_REFRESH_SECRET = 'refreshsecret';

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

jest.mock('../config/db', () => ({ query: jest.fn() }));

const authRoutes = require('../routes/authRoutes');
const { authMiddleware } = require('../controllers/userController');

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

const app = express();
app.use(express.json());
app.use('/api/claims', authRoutes);
app.use('/api/invoices', authRoutes);
app.use(uploadRouter);
app.use(anomalyRouter);
app.use(signingRouter);
app.use(entityRouter);
app.use(fieldRouter);
app.use(feedbackRouter);

const db = require('../config/db');

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
  });
});
