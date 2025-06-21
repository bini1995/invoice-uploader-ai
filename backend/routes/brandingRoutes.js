const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { uploadLogo, getLogo } = require('../controllers/brandingController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', getLogo);
router.post('/', authMiddleware, authorizeRoles('admin'), upload.single('logo'), uploadLogo);

module.exports = router;
