const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../controllers/userController');
const { uploadPOs, getPOs } = require('../controllers/purchaseOrderController');

router.post('/upload', authMiddleware, authorizeRoles('admin'), upload.single('poFile'), uploadPOs);
router.get('/', authMiddleware, authorizeRoles('admin','reviewer','finance'), getPOs);

module.exports = router;
