import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const uploadDocument = jest.fn((req, res) => res.json({ ok: true }));
const listDocuments = jest.fn((req, res) => res.json({ claims: [] }));
const updateStatus = jest.fn((req, res) => res.json({ id: req.params.id, status: req.body.status }));
const getDocument = jest.fn((req, res) => res.json({ id: req.params.id }));
const handleClaimStatusWebhook = jest.fn((req, res) => res.json({ received: true }));

jest.unstable_mockModule('../controllers/claimController.js', () => ({
  uploadDocument,
  listDocuments,
  updateStatus,
  getDocument,
  handleClaimStatusWebhook,
  extractDocument: jest.fn((req, res) => res.json({ ok: true })),
  extractClaimFields: jest.fn((req, res) => res.json({ ok: true })),
  saveCorrections: jest.fn((req, res) => res.json({ ok: true })),
  summarizeDocument: jest.fn((req, res) => res.json({ ok: true })),
  getDocumentVersions: jest.fn((req, res) => res.json({ versions: [] })),
  restoreDocumentVersion: jest.fn((req, res) => res.json({ restored: true })),
  uploadDocumentVersion: jest.fn((req, res) => res.json({ ok: true })),
  updateLifecycle: jest.fn((req, res) => res.json({ ok: true })),
  checkCompliance: jest.fn((req, res) => res.json({ ok: true })),
  getEntityTotals: jest.fn((req, res) => res.json({ totals: [] })),
  searchDocuments: jest.fn((req, res) => res.json({ results: [] })),
  exportSummaryPDF: jest.fn((req, res) => res.json({ ok: true })),
  submitExtractionFeedback: jest.fn((req, res) => res.json({ ok: true })),
  getExtractionFeedback: jest.fn((req, res) => res.json({ ok: true })),
  addReviewNote: jest.fn((req, res) => res.json({ ok: true })),
  getReviewNotes: jest.fn((req, res) => res.json({ notes: [] })),
  addComment: jest.fn((req, res) => res.json({ ok: true })),
  getComments: jest.fn((req, res) => res.json({ comments: [] })),
  getReviewQueue: jest.fn((req, res) => res.json({ queue: [] })),
  exportClaims: jest.fn((req, res) => res.json({ ok: true })),
  getClaimMetrics: jest.fn((req, res) => res.json({ ok: true })),
  getUploadHeatmap: jest.fn((req, res) => res.json({ heatmap: [] })),
  getTopVendors: jest.fn((req, res) => res.json({ vendors: [] })),
  getCptExplainability: jest.fn((req, res) => res.json({ ok: true })),
  parseEdiHl7: jest.fn((req, res) => res.json({ ok: true })),
}));

const authMiddleware = jest.fn((req, res, next) => {
  req.user = { id: 1, role: 'admin' };
  next();
});
const authorizeRoles = jest.fn(() => (req, res, next) => {
  req.rolesChecked = true;
  next();
});

jest.unstable_mockModule('../controllers/userController.js', () => ({
  authMiddleware,
  authorizeRoles,
}));

const uploadLimiter = jest.fn((req, res, next) => next());
jest.unstable_mockModule('../middleware/rateLimit.js', () => ({ uploadLimiter }));
jest.unstable_mockModule('../middleware/fileSizeLimit.js', () => ({
  default: (req, res, next) => next(),
}));
const verifyClaimWebhookSignature = jest.fn((req, res, next) => next());
jest.unstable_mockModule('../middleware/claimWebhookAuth.js', () => ({
  verifyClaimWebhookSignature,
}));

const { default: claimRoutes } = await import('../routes/claimRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/claims', claimRoutes);

describe('Claim routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('lists claims with auth', async () => {
    const res = await request(app).get('/api/claims');
    expect(res.statusCode).toBe(200);
    expect(listDocuments).toHaveBeenCalled();
  });

  test('uploads claim file', async () => {
    const res = await request(app)
      .post('/api/claims/upload')
      .attach('file', Buffer.from('test'), 'claim.csv');
    expect(res.statusCode).toBe(200);
    expect(uploadDocument).toHaveBeenCalled();
  });

  test('updates status with role guard', async () => {
    const res = await request(app)
      .patch('/api/claims/123/status')
      .send({ status: 'Approved' });
    expect(res.statusCode).toBe(200);
    expect(authorizeRoles).toHaveBeenCalledWith('admin', 'internal_ops', 'adjuster');
    expect(updateStatus).toHaveBeenCalled();
  });

  test('fetches claim by id', async () => {
    const res = await request(app).get('/api/claims/42');
    expect(res.statusCode).toBe(200);
    expect(getDocument).toHaveBeenCalled();
  });

  test('accepts webhook callbacks', async () => {
    const res = await request(app)
      .post('/api/claims/status-webhook')
      .send({ status: 'Processed' });
    expect(res.statusCode).toBe(200);
    expect(verifyClaimWebhookSignature).toHaveBeenCalled();
    expect(handleClaimStatusWebhook).toHaveBeenCalled();
  });
});
