const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../controllers/userController');
const { uploadLimiter } = require('../middleware/rateLimit');
const { uploadPOs, getPOs } = require('../controllers/purchaseOrderController');

router.post('/upload', uploadLimiter, authMiddleware, authorizeRoles('admin'), upload.single('poFile'), uploadPOs);
router.get('/', authMiddleware, authorizeRoles('admin','approver','accountant'), getPOs);

module.exports = router;
