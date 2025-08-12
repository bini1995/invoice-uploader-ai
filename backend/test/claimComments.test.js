process.env.JWT_SECRET = 'testsecret-123456789012345678901234';

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

jest.mock('../config/db', () => ({ query: jest.fn() }));
const db = require('../config/db');

const claimRoutes = require('../routes/claimRoutes');

const app = express();
app.use(express.json());
app.use('/api/claims', claimRoutes);

function tokenFor(role) {
  return jwt.sign({ userId: 1, role, username: 'test' }, process.env.JWT_SECRET);
}

describe('Claim comments', () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  test('viewer cannot add comment', async () => {
    const res = await request(app)
      .post('/api/claims/1/comments')
      .set('Authorization', `Bearer ${tokenFor('viewer')}`)
      .send({ text: 'hi' });
    expect(res.statusCode).toBe(403);
  });

  test('rejects XSS', async () => {
    const res = await request(app)
      .post('/api/claims/1/comments')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ text: '<script>alert(1)</script>' });
    expect(res.statusCode).toBe(400);
    expect(res.body.detail).toMatch(/html/i);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('rejects too-long comment', async () => {
    const res = await request(app)
      .post('/api/claims/1/comments')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ text: 'a'.repeat(1001) });
    expect(res.statusCode).toBe(400);
    expect(res.body.detail).toMatch(/1-1000/);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('returns flattened comments', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, parent_id: null, text: 'top', created_at: '2024-01-01' },
        { id: 2, parent_id: 1, text: 'reply', created_at: '2024-01-02' },
      ],
    });
    const res = await request(app)
      .get('/api/claims/1/comments')
      .set('Authorization', `Bearer ${tokenFor('admin')}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchSnapshot();
  });

  test('flattens deeply nested threads in order', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, parent_id: null, text: 'root', created_at: '2024-01-01' },
        { id: 2, parent_id: 1, text: 'child', created_at: '2024-01-02' },
        { id: 3, parent_id: 2, text: 'grandchild', created_at: '2024-01-03' },
        { id: 4, parent_id: 1, text: 'sibling', created_at: '2024-01-04' },
        { id: 5, parent_id: null, text: 'second root', created_at: '2024-01-05' }
      ]
    });
    const res = await request(app)
      .get('/api/claims/1/comments')
      .set('Authorization', `Bearer ${tokenFor('admin')}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.comments.map((c) => ({ id: c.id, depth: c.depth }))).toEqual([
      { id: 1, depth: 0 },
      { id: 2, depth: 1 },
      { id: 3, depth: 2 },
      { id: 4, depth: 1 },
      { id: 5, depth: 0 }
    ]);
  });

  test('add comment to missing claim returns 404', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post('/api/claims/999/comments')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ text: 'hi' });
    expect(res.statusCode).toBe(404);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('fetching comments for missing claim returns 404', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .get('/api/claims/999/comments')
      .set('Authorization', `Bearer ${tokenFor('admin')}`);
    expect(res.statusCode).toBe(404);
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});
