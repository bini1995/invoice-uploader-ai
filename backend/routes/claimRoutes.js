import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../config/db.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import fileSizeLimit from '../middleware/fileSizeLimit.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import {
  uploadDocument,
  batchUploadDocuments,
  semanticSearch,
  extractDocument,
  extractClaimFields,
  saveCorrections,
  summarizeDocument,
  listDocuments,
  getDocument,
  getDocumentVersions,
  restoreDocumentVersion,
  uploadDocumentVersion,
  updateLifecycle,
  checkCompliance,
  getEntityTotals,
  searchDocuments,
  exportSummaryPDF,
  submitExtractionFeedback,
  getExtractionFeedback,
  addReviewNote,
  getReviewNotes,
  addComment,
  getComments,
  getReviewQueue,
  updateStatus,
  escalateClaim,
  handleClaimStatusWebhook,
  exportClaims,
  getClaimMetrics,
  getUploadHeatmap,
  getTopVendors,
  getCptExplainability,
  parseEdiHl7,
  ingestClaimIntegration,
  transcribeFnolAudio,
  purgeDemoDocuments,
  getClaimConfidence,
  getClaimDuplicates,
  resolveClaimDuplicate,
  getDuplicateOverview,
  generateChronology,
  getChronology,
} from '../controllers/claimController.js';
import { getAnomalyExplainability } from '../controllers/anomalyExplainController.js';
import { getClaimAuditTrail } from '../controllers/auditController.js';
import { processClaimWorkflow } from '../controllers/agenticClaimsController.js';
import { verifyClaimWebhookSignature } from '../middleware/claimWebhookAuth.js';

const router = express.Router();
const allowed = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.eml', '.csv'];
const upload = multer({
  dest: 'uploads/docs/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max, csv checked separately
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});
const integrationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.edi', '.txt', '.hl7', '.x12'];
    if (!allowedExt.includes(ext)) {
      return cb(new Error('Invalid integration file type'));
    }
    cb(null, true);
  }
});
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/x-m4a',
      'audio/ogg',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid audio file type'));
    }
    cb(null, true);
  }
});

router.post('/upload', uploadLimiter, authMiddleware, upload.single('file'), fileSizeLimit, uploadDocument);
router.post('/batch-upload', uploadLimiter, authMiddleware, upload.array('files', 50), batchUploadDocuments);
router.get('/semantic-search', authMiddleware, semanticSearch);
router.post('/status-webhook', verifyClaimWebhookSignature, handleClaimStatusWebhook);
router.post('/process', authMiddleware, processClaimWorkflow);
router.post('/fnol/transcribe', authMiddleware, audioUpload.single('audio'), transcribeFnolAudio);
router.get('/upload-heatmap', authMiddleware, getUploadHeatmap);
router.get('/top-vendors', authMiddleware, getTopVendors);
router.get('/', authMiddleware, listDocuments);
router.get('/totals-by-entity', authMiddleware, getEntityTotals);
router.get('/search', authMiddleware, searchDocuments);
router.get('/review-queue', authMiddleware, getReviewQueue);
router.get('/explain', authMiddleware, authorizeRoles('admin', 'internal_ops'), getAnomalyExplainability);
router.get('/duplicates/overview', authMiddleware, getDuplicateOverview);
router.get(
  '/metrics',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops'),
  getClaimMetrics
);
router.get('/report/pdf', authMiddleware, exportSummaryPDF);
router.post('/export', authMiddleware, exportClaims);
router.post(
  '/escalate',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops', 'adjuster'),
  escalateClaim
);
router.post('/edi-hl7/parse', authMiddleware, integrationUpload.single('file'), parseEdiHl7);
router.post('/ingest', authMiddleware, integrationUpload.single('file'), ingestClaimIntegration);
router.delete(
  '/purge-demo',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops'),
  purgeDemoDocuments
);

router.get('/quick-stats', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        COUNT(*) as total_claims,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_claims,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_claims,
        COUNT(*) FILTER (WHERE status = 'denied' OR status = 'rejected') as denied_claims,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as claims_this_month,
        ROUND(AVG(CASE WHEN overall_confidence IS NOT NULL THEN overall_confidence ELSE NULL END)::numeric, 1) as avg_confidence
      FROM documents d
      LEFT JOIN claim_fields cf ON cf.document_id = d.id
      WHERE d.tenant_id = $1`,
      [req.tenantId]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error('Quick stats error:', err);
    res.status(500).json({ message: 'Failed to fetch quick stats' });
  }
});

router.get('/monthly-insights', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'denied' OR status = 'rejected') as denied
      FROM documents
      WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12`,
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Monthly insights error:', err);
    res.status(500).json({ message: 'Failed to fetch monthly insights' });
  }
});

router.get('/vendor-scorecards', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        COALESCE(fields->>'provider_name', fields->>'vendor', 'Unknown') as vendor_name,
        COUNT(*) as total_claims,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'denied' OR status = 'rejected') as denied,
        ROUND(AVG(CASE WHEN cf.overall_confidence IS NOT NULL THEN cf.overall_confidence ELSE NULL END)::numeric, 1) as avg_confidence
      FROM documents d
      LEFT JOIN claim_fields cf ON cf.document_id = d.id
      WHERE d.tenant_id = $1
      GROUP BY COALESCE(fields->>'provider_name', fields->>'vendor', 'Unknown')
      ORDER BY total_claims DESC
      LIMIT 20`,
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Vendor scorecards error:', err);
    res.status(500).json({ message: 'Failed to fetch vendor scorecards' });
  }
});

router.get('/:id', authMiddleware, getDocument);
router.post('/:id/extract', authMiddleware, extractDocument);
router.post('/:id/extract-fields', authMiddleware, extractClaimFields);
router.post('/:id/corrections', authMiddleware, saveCorrections);
router.get('/:id/summary', authMiddleware, summarizeDocument);
router.get('/:id/versions', authMiddleware, getDocumentVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, restoreDocumentVersion);
router.post('/:id/version', uploadLimiter, authMiddleware, upload.single('file'), uploadDocumentVersion);
router.put('/:id/lifecycle', authMiddleware, updateLifecycle);
router.post('/:id/compliance', authMiddleware, checkCompliance);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin', 'internal_ops', 'adjuster', 'viewer', 'broker'), updateStatus);
router.get('/:id/cpt-explain', authMiddleware, getCptExplainability);
router.get('/:id/audit', authMiddleware, authorizeRoles('admin', 'internal_ops', 'auditor'), getClaimAuditTrail);
router.get('/:id/confidence', authMiddleware, getClaimConfidence);
router.get('/:id/duplicates', authMiddleware, getClaimDuplicates);
router.post('/:id/duplicates/:flagId/resolve', authMiddleware, authorizeRoles('admin', 'internal_ops', 'adjuster', 'viewer', 'broker'), resolveClaimDuplicate);
router.get('/:id/feedback', authMiddleware, getExtractionFeedback);
router.post('/:id/feedback', authMiddleware, submitExtractionFeedback);
router.get('/:id/review-notes', authMiddleware, getReviewNotes);
router.post('/:id/review-notes', authMiddleware, authorizeRoles('admin', 'internal_ops', 'adjuster'), addReviewNote);
router.get('/:id/comments', authMiddleware, getComments);
router.post(
  '/:id/comments',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops', 'adjuster'),
  addComment
);
router.post('/:id/chronology/generate', authMiddleware, generateChronology);
router.get('/:id/chronology', authMiddleware, getChronology);

export default router;
