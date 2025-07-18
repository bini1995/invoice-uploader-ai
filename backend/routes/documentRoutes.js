const express = require('express');
const multer = require('multer');
const {
  uploadDocument,
  extractDocument,
  saveCorrections,
  summarizeDocument,
  getDocumentVersions,
  restoreDocumentVersion,
} = require('../controllers/documentController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();
const upload = multer({ dest: 'uploads/docs/' });

router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);
router.post('/:id/extract', authMiddleware, extractDocument);
router.post('/:id/corrections', authMiddleware, saveCorrections);
router.get('/:id/summary', authMiddleware, summarizeDocument);
router.get('/:id/versions', authMiddleware, getDocumentVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, restoreDocumentVersion);

module.exports = router;
