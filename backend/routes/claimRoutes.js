const express = require('express');
const multer = require('multer');
const path = require('path');
const {
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
  exportClaims,
  getClaimMetrics,
  getUploadHeatmap,
  getTopVendors,
} = require('../controllers/claimController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

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
const fileSizeLimit = require('../middleware/fileSizeLimit');
const { uploadLimiter } = require('../middleware/rateLimit');

router.post('/upload', uploadLimiter, authMiddleware, upload.single('file'), fileSizeLimit, uploadDocument);
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
router.get(
  '/metrics',
  authMiddleware,
  authorizeRoles('admin', 'internal_ops'),
  getClaimMetrics
);
router.get('/report/pdf', authMiddleware, exportSummaryPDF);
router.post('/export', authMiddleware, exportClaims);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin', 'internal_ops', 'adjuster'), updateStatus);
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

module.exports = router;
