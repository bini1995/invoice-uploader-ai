const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadDocument,
  extractDocument,
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
} = require('../controllers/claimController');
const { authMiddleware } = require('../controllers/userController');

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
router.get('/', authMiddleware, listDocuments);
router.post('/:id/extract', authMiddleware, extractDocument);
router.post('/:id/corrections', authMiddleware, saveCorrections);
router.get('/:id/summary', authMiddleware, summarizeDocument);
router.get('/:id/versions', authMiddleware, getDocumentVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, restoreDocumentVersion);
router.post('/:id/version', uploadLimiter, authMiddleware, upload.single('file'), uploadDocumentVersion);
router.put('/:id/lifecycle', authMiddleware, updateLifecycle);
router.post('/:id/compliance', authMiddleware, checkCompliance);
router.get('/totals-by-entity', authMiddleware, getEntityTotals);
router.get('/search', authMiddleware, searchDocuments);
router.get('/report/pdf', authMiddleware, exportSummaryPDF);
router.get('/:id', authMiddleware, getDocument);

module.exports = router;
