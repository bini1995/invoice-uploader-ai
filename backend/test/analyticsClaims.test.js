process.env.JWT_SECRET = 'testsecret';

const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({ query: jest.fn() }));
const db = require('../config/db');

jest.mock('../ai/fraudDetection', () => ({ detectFraud: jest.fn() }));
const { detectFraud } = require('../ai/fraudDetection');

jest.mock('../controllers/userController', () => ({
  authMiddleware: (req, res, next) => {
    if (req.headers.authorization === 'Bearer validtoken') {
      req.user = { userId: 1 };
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  }
}));

const analyticsRoutes = require('../routes/analyticsRoutes');

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRoutes);

beforeEach(() => {
  db.query.mockReset();
  detectFraud.mockReset();
});

describe('GET /api/analytics/claims', () => {
  test('requires auth', async () => {
    const res = await request(app).get('/api/analytics/claims');
    expect(res.status).toBe(401);
  });

  test('returns claim analytics for authorized user', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { claim_type: 'auto', count: 2, total_amount: 200 },
        { claim_type: 'home', count: 1, total_amount: 500 }
      ]
    });

    const res = await request(app)
      .get('/api/analytics/claims')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      claims: [
        { claim_type: 'auto', count: 2, total_amount: 200 },
        { claim_type: 'home', count: 1, total_amount: 500 }
      ]
    });
  });

  test('defaults missing values to zero', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { claim_type: 'auto', count: null, total_amount: undefined }
      ]
    });

    const res = await request(app)
      .get('/api/analytics/claims')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      claims: [{ claim_type: 'auto', count: 0, total_amount: 0 }]
    });
  });
});

describe('GET /api/analytics/claims/fraud', () => {
  test('requires auth', async () => {
    const res = await request(app).get('/api/analytics/claims/fraud');
    expect(res.status).toBe(401);
  });

  test('returns suspicious claims for authorized user', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, amount: 100 },
        { id: 2, amount: 500 }
      ]
    });
    detectFraud.mockReturnValueOnce([false, true]);

    const res = await request(app)
      .get('/api/analytics/claims/fraud')
      .set('Authorization', 'Bearer validtoken');

    expect(db.query).toHaveBeenCalled();
    expect(detectFraud).toHaveBeenCalledWith([[100], [500]]);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ suspicious: [2] });
  });
});

