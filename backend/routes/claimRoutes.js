import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import fileSizeLimit from '../middleware/fileSizeLimit.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import {
  uploadDocument,
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
  handleClaimStatusWebhook,
  exportClaims,
  getClaimMetrics,
  getUploadHeatmap,
  getTopVendors,
  getCptExplainability,
  parseEdiHl7,
} from '../controllers/claimController.js';
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

router.post('/upload', uploadLimiter, authMiddleware, upload.single('file'), fileSizeLimit, uploadDocument);
router.post('/status-webhook', verifyClaimWebhookSignature, handleClaimStatusWebhook);
router.get('/upload-heatmap', authMiddleware, getUploadHeatmap);
router.get('/top-vendors', authMiddleware, getTopVendors);
router.get('/', authMiddleware, listDocuments);
router.post('/:id/extract', authMiddleware, extractDocument);
router.post('/:id/extract-fields', authMiddleware, extractClaimFields);
router.post('/:id/corrections', authMiddleware, saveCorrections);
router.get('/:id/summary', authMiddleware, summarizeDocument);
router.get('/:id/versions', authMiddleware, getDocumentVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, restoreDocumentVersion);
router.post('/:id/version', uploadLimiter, authMiddleware, upload.single('file'), uploadDocumentVersion);
router.put('/:id/lifecycle', authMiddleware, updateLifecycle);
router.post('/:id/compliance', authMiddleware, checkCompliance);
router.get('/totals-by-entity', authMiddleware, getEntityTotals);
router.get('/search', authMiddleware, searchDocuments);
router.get('/review-queue', authMiddleware, getReviewQueue);
router.post('/edi-hl7/parse', authMiddleware, integrationUpload.single('file'), parseEdiHl7);
router.get(
  '/metrics',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops'),
  getClaimMetrics
);
router.get('/report/pdf', authMiddleware, exportSummaryPDF);
router.post('/export', authMiddleware, exportClaims);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin', 'internal_ops', 'adjuster'), updateStatus);
router.get('/:id/cpt-explain', authMiddleware, getCptExplainability);
router.get('/:id', authMiddleware, getDocument);
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

export default router;
