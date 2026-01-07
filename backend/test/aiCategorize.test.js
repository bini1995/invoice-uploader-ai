import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

process.env.JWT_SECRET = 'testsecret';

jest.unstable_mockModule('axios', () => ({ default: { post: jest.fn() } }));
jest.unstable_mockModule('../config/db.js', () => ({ default: { query: jest.fn() } }));
jest.unstable_mockModule('../controllers/userController.js', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1 };
    next();
  }
}));

jest.unstable_mockModule('../middleware/rateLimit.js', () => ({
  aiLimiter: (req, res, next) => next()
}));

const { default: axios } = await import('axios');
const { default: db } = await import('../config/db.js');
const { default: aiRoutes } = await import('../routes/aiRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);

beforeEach(() => {
  axios.post.mockReset();
  db.query.mockReset();
});

describe('/api/ai/categorize', () => {
  test('uses claim_type hint and returns it in categories', async () => {
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'HR, Expense' } }] }
    });
    db.query.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post('/api/ai/categorize')
      .send({ content: 'document text', claim_type: 'auto' });

    const prompt = axios.post.mock.calls[0][1].messages[0].content;
    expect(prompt).toMatch('Claim type: auto');

    expect(res.status).toBe(200);
    res.body.categories.forEach((c) => {
      expect(c.claim_type).toBe('auto');
    });
    expect(res.body.claim_type).toBe('auto');
  });

  test('omits claim_type when not provided', async () => {
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'HR, Expense' } }] }
    });
    db.query.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post('/api/ai/categorize')
      .send({ content: 'document text' });

    const prompt = axios.post.mock.calls[0][1].messages[0].content;
    expect(prompt).not.toMatch(/Claim type/);

    res.body.categories.forEach((c) => {
      expect(c.claim_type).toBeNull();
    });
    expect(res.body.claim_type).toBeNull();
  });
});
