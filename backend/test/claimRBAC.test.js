import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'testsecret-1234567890123456789012';

jest.unstable_mockModule('../config/db.js', () => ({ default: { query: jest.fn() } }));
jest.unstable_mockModule('../utils/fileToText.js', () => ({ default: jest.fn() }));

const { default: db } = await import('../config/db.js');
const { default: claimRoutes } = await import('../routes/claimRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/claims', claimRoutes);

function tokenFor(role) {
  return jwt.sign({ userId: 1, role, username: 'test' }, process.env.JWT_SECRET);
}

describe('Claim RBAC', () => {
  beforeEach(() => {
    db.query.mockReset();
  });
  test('viewer cannot update status', async () => {
    const res = await request(app)
      .patch('/api/claims/1/status')
      .set('Authorization', `Bearer ${tokenFor('viewer')}`)
      .send({ status: 'approved' });
    expect(res.statusCode).toBe(403);
  });

  test('viewer cannot add review note', async () => {
    const res = await request(app)
      .post('/api/claims/1/review-notes')
      .set('Authorization', `Bearer ${tokenFor('viewer')}`)
      .send({ note: 'hi' });
    expect(res.statusCode).toBe(403);
  });

  test('rejects XSS in review note', async () => {
    const res = await request(app)
      .post('/api/claims/1/review-notes')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ note: '<script>alert(1)</script>' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/unsafe html/i);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('rejects too-long review note', async () => {
    const longNote = 'a'.repeat(1001);
    const res = await request(app)
      .post('/api/claims/1/review-notes')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ note: longNote });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/1-1000/);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('rejects empty review note', async () => {
    const res = await request(app)
      .post('/api/claims/1/review-notes')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ note: '   ' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/1-1000/);
    expect(db.query).not.toHaveBeenCalled();
  });
});
