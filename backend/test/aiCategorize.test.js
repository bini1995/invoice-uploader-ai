process.env.JWT_SECRET = 'testsecret';

const request = require('supertest');
const express = require('express');

jest.mock('axios');
const axios = require('axios');

jest.mock('../config/db', () => ({ query: jest.fn() }));
const db = require('../config/db');

jest.mock('../controllers/userController', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1 };
    next();
  }
}));

jest.mock('../middleware/rateLimit', () => ({
  aiLimiter: (req, res, next) => next()
}));

const aiRoutes = require('../routes/aiRoutes');

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
