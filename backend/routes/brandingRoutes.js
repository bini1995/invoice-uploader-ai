const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
  uploadLogo,
  getLogo,
  setAccentColor,
  getAccentColor,
} = require('../controllers/brandingController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');
const { uploadLimiter } = require('../middleware/rateLimit');

router.get('/', getLogo);
router.post('/', uploadLimiter, authMiddleware, authorizeRoles('admin'), upload.single('logo'), uploadLogo);
router.get('/color', getAccentColor);
router.post('/color', authMiddleware, authorizeRoles('admin'), setAccentColor);

module.exports = router;
