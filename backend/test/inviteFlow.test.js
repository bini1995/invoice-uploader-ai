import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

process.env.JWT_SECRET = 'test';

jest.unstable_mockModule('../config/db.js', () => ({ default: { query: jest.fn() } }));
jest.unstable_mockModule('../utils/activityLogger.js', () => ({ logActivity: jest.fn() }));
jest.unstable_mockModule('../utils/eventTracker.js', () => ({ trackEvent: jest.fn() }));
jest.unstable_mockModule('../controllers/userController.js', () => ({
  authMiddleware: (req, res, next) => { if (req.user) return next(); return res.status(401).end(); },
  authorizeRoles: (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).end();
    next();
  },
}));

const { default: inviteRoutes } = await import('../routes/inviteRoutes.js');
const { default: db } = await import('../config/db.js');
const { logActivity } = await import('../utils/activityLogger.js');

function makeApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.user = user; next(); });
  app.use('/api/invites', inviteRoutes);
  return app;
}

describe('invite flow', () => {
  beforeEach(() => {
    db.query.mockReset();
    logActivity.mockReset();
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
    db.query.mockResolvedValueOnce({});
    const app = makeApp({ role: 'admin', userId: 1, username: 'a' });
    const res = await request(app).post('/api/invites').send({ role: 'viewer' });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalled();
  });
});
