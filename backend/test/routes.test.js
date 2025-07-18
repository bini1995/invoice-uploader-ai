process.env.JWT_SECRET = 'testsecret';
process.env.JWT_REFRESH_SECRET = 'refreshsecret';

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../config/redis', () => ({
  sadd: jest.fn(),
  sismember: jest.fn().mockResolvedValue(1),
  srem: jest.fn()
}));

const authRoutes = require('../routes/authRoutes');
const { authMiddleware } = require('../controllers/userController');

const uploadRouter = express.Router();
uploadRouter.post('/api/documents/upload', authMiddleware, (req, res) => res.json({ ok: true }));
const anomalyRouter = express.Router();
anomalyRouter.get('/api/:tenantId/documents/anomalies', authMiddleware, (req, res) => res.json({ anomalies: [] }));

const app = express();
app.use(express.json());
app.use('/api/documents', authRoutes);
app.use(uploadRouter);
app.use(anomalyRouter);

const db = require('../config/db');

describe('Auth and documents', () => {
  test('login returns token', async () => {
    const hash = await bcrypt.hash('pass', 10);
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'user', password_hash: hash, role: 'admin' }] });
    const res = await request(app).post('/api/documents/login').send({ username: 'user', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('upload requires auth', async () => {
    const res = await request(app).post('/api/documents/upload');
    expect(res.statusCode).toBe(401);
  });

  test('anomaly route requires auth', async () => {
    const res = await request(app).get('/api/1/documents/anomalies');
    expect(res.statusCode).toBe(401);
  });
});
