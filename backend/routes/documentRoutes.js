const express = require('express');
const multer = require('multer');
const { uploadDocument, extractDocument, saveCorrections } = require('../controllers/documentController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();
const upload = multer({ dest: 'uploads/docs/' });

router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);
router.post('/:id/extract', authMiddleware, extractDocument);
router.post('/:id/corrections', authMiddleware, saveCorrections);

module.exports = router;
