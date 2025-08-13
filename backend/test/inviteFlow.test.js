process.env.JWT_SECRET = 'test';

const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/activityLogger', () => ({ logActivity: jest.fn() }));
jest.mock('../utils/eventTracker', () => ({ trackEvent: jest.fn() }));
jest.mock('../controllers/userController', () => ({
  authMiddleware: (req, res, next) => { if (req.user) return next(); return res.status(401).end(); },
  authorizeRoles: (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).end();
    next();
  },
}));

const inviteRoutes = require('../routes/inviteRoutes');

function makeApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.user = user; next(); });
  app.use('/api/invites', inviteRoutes);
  return app;
}

describe('invite flow', () => {
  beforeEach(() => {
    require('../config/db').query.mockReset();
    require('../utils/activityLogger').logActivity.mockReset();
  });

  test('rejects invalid role', async () => {
    const app = makeApp({ role: 'admin', userId: 1, username: 'a' });
    const res = await request(app).post('/api/invites').send({ role: 'bad' });
    expect(res.status).toBe(400);
  });

  test('403 for non-admin', async () => {
    const app = makeApp({ role: 'viewer' });
    const res = await request(app).post('/api/invites').send({ role: 'viewer' });
    expect(res.status).toBe(403);
  });

  test('success logs audit entry', async () => {
    const db = require('../config/db');
    db.query.mockResolvedValueOnce({});
    const app = makeApp({ role: 'admin', userId: 1, username: 'a' });
    const res = await request(app).post('/api/invites').send({ role: 'viewer' });
    expect(res.status).toBe(200);
    expect(require('../utils/activityLogger').logActivity).toHaveBeenCalled();
  });
});
