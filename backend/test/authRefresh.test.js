import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import session from 'express-session';

process.env.JWT_SECRET = 'testsecret-1234567890123456789012';
process.env.JWT_REFRESH_SECRET = 'refreshsecret-12345678901234567890';
process.env.SESSION_SECRET = 'sessionsecret-1234567890123456789012';

jest.unstable_mockModule('../config/db.js', () => ({ default: { query: jest.fn() } }));

const { default: db } = await import('../config/db.js');
const { default: authRoutes } = await import('../routes/authRoutes.js');
const { default: createSessionMiddleware } = await import('../middleware/session.js');

const app = express();
app.use(express.json());
app.use(createSessionMiddleware({ store: new session.MemoryStore() }));
app.use('/api/auth', authRoutes);

describe('Auth refresh tokens', () => {
  test('refresh rotates token when session is valid', async () => {
    const passwordHash = await bcrypt.hash('pass', 10);
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 7, username: 'user', password_hash: passwordHash, role: 'admin' }] })
      .mockResolvedValueOnce({ rows: [{ id: 7, username: 'user', role: 'admin' }] });

    const agent = request.agent(app);
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ username: 'user', password: 'pass' });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.refreshToken).toBeDefined();

    const refreshRes = await agent
      .post('/api/auth/refresh')
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.token).toBeDefined();
    expect(refreshRes.body.refreshToken).toBeDefined();
    expect(refreshRes.body.refreshToken).not.toEqual(loginRes.body.refreshToken);
  });
});
