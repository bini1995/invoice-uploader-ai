import { jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import express from 'express';

process.env.JWT_SECRET = 'testsecret';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

jest.unstable_mockModule('../config/db.js', () => ({ default: { query: jest.fn() } }));
jest.unstable_mockModule('../ai/claimFieldExtractor.js', () => ({ extractClaimFields: jest.fn() }));
jest.unstable_mockModule('../controllers/userController.js', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { userId: 1 };
    next();
  },
  authorizeRoles: () => (req, res, next) => next()
}));

jest.unstable_mockModule('../metrics.js', () => ({
  claimUploadCounter: { labels: () => ({ inc: jest.fn() }) },
  fieldExtractCounter: { labels: () => ({ inc: jest.fn() }) },
  exportAttemptCounter: { labels: () => ({ inc: jest.fn() }) },
  feedbackFlaggedCounter: { labels: () => ({ inc: jest.fn() }) },
  extractDuration: { startTimer: () => jest.fn() }
}));

jest.unstable_mockModule('../utils/documentVersionLogger.js', () => ({ recordDocumentVersion: jest.fn() }));
jest.unstable_mockModule('../utils/logger.js', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const { default: db } = await import('../config/db.js');
const { extractClaimFields } = await import('../ai/claimFieldExtractor.js');
const { default: claimRoutes } = await import('../routes/claimRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/claims', claimRoutes);

const claimSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schemas/claim.json'), 'utf8')
);

describe('POST /api/claims/:id/extract', () => {
  let tmpFile;
  const fields = { claim_number: 'CL123', claimant_name: 'John Doe', claim_amount: 1000 };

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `doc-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, 'dummy content');
    db.query.mockReset();
    extractClaimFields.mockReset();
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  test('returns fields and schema when valid preset is provided', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, doc_type: 'claim_invoice', path: tmpFile }] });
    db.query.mockResolvedValue({ rows: [] });
    extractClaimFields.mockResolvedValue({ fields });

    const res = await request(app).post('/api/claims/1/extract?schema=claim');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(fields);
    expect(res.body.schema).toEqual(claimSchema);
  });

  test('returns fields without schema when preset is missing', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, doc_type: 'claim_invoice', path: tmpFile }] });
    db.query.mockResolvedValue({ rows: [] });
    extractClaimFields.mockResolvedValue({ fields });

    const res = await request(app).post('/api/claims/1/extract');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(fields);
    expect(res.body.schema).toBeUndefined();
  });

  test('returns fields and null schema when preset is invalid', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, doc_type: 'claim_invoice', path: tmpFile }] });
    db.query.mockResolvedValue({ rows: [] });
    extractClaimFields.mockResolvedValue({ fields });

    const res = await request(app).post('/api/claims/1/extract?schema=unknown');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(fields);
    expect(res.body.schema).toBeNull();
  });
});
