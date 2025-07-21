const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadDocument,
  extractDocument,
  saveCorrections,
  summarizeDocument,
  getDocumentVersions,
  restoreDocumentVersion,
  uploadDocumentVersion,
  updateLifecycle,
  checkCompliance,
  getEntityTotals,
} = require('../controllers/documentController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();
const allowed = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.eml'];
const upload = multer({
  dest: 'uploads/docs/',
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});

router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);
router.post('/:id/extract', authMiddleware, extractDocument);
router.post('/:id/corrections', authMiddleware, saveCorrections);
router.get('/:id/summary', authMiddleware, summarizeDocument);
router.get('/:id/versions', authMiddleware, getDocumentVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, restoreDocumentVersion);
router.post('/:id/version', authMiddleware, upload.single('file'), uploadDocumentVersion);
router.put('/:id/lifecycle', authMiddleware, updateLifecycle);
router.post('/:id/compliance', authMiddleware, checkCompliance);
router.get('/totals-by-entity', authMiddleware, getEntityTotals);

module.exports = router;
