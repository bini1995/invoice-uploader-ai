process.env.JWT_SECRET = 'testsecret';

const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({ query: jest.fn() }));

jest.mock('../controllers/userController', () => ({
  authMiddleware: (req, res, next) => {
    if (req.headers.authorization === 'Bearer validtoken') {
      req.user = { role: 'admin' };
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  },
  authorizeRoles: (...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  },
}));

const workflowRoutes = require('../routes/documentWorkflowRoutes');

const app = express();
app.use(express.json());
app.use('/api/workflows', workflowRoutes);

describe('GET /api/workflows?type=insurance', () => {
  test('requires auth', async () => {
    const res = await request(app).get('/api/workflows?type=insurance');
    expect(res.status).toBe(401);
  });

  test('returns insurance workflow for admin', async () => {
    const res = await request(app)
      .get('/api/workflows?type=insurance')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      workflow: {
        doc_type: 'claim',
        steps: ['fnol', 'estimate', 'final_bill'],
      },
    });
  });
});
