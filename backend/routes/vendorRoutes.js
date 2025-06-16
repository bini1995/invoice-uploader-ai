const express = require('express');
const router = express.Router();
const {
  listVendors,
  updateVendorNotes,
  getVendorInfo,
  matchVendors,
  predictVendorBehavior,
  exportVendorsCSV,
  importVendorsCSV,
} = require('../controllers/vendorController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, listVendors);
router.get('/export', authMiddleware, authorizeRoles('admin'), exportVendorsCSV);
router.post('/import', authMiddleware, authorizeRoles('admin'), upload.single('file'), importVendorsCSV);
router.get('/match', authMiddleware, matchVendors);
router.patch('/:vendor/notes', authMiddleware, authorizeRoles('admin'), updateVendorNotes);
router.get('/:vendor/info', authMiddleware, getVendorInfo);
router.get('/:vendor/predict', authMiddleware, predictVendorBehavior);

module.exports = router;
