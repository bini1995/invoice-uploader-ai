const express = require('express');
const router = express.Router();
const {
  listVendors,
  updateVendorNotes,
  getVendorInfo,
  matchVendors,
  aiVendorMatch,
  predictVendorBehavior,
  exportVendorsCSV,
  importVendorsCSV,
  getBehaviorFlags,
  getVendorAnalytics,
  updateVendorCountry,
  updateVendorProfile,
  deleteVendor,
  getVendorRiskProfile,
  vendorMatchFeedback,
  getDuplicateVendors,
  getVendorAnomalies,
} = require('../controllers/vendorController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, listVendors);
router.get('/export', authMiddleware, authorizeRoles('admin'), exportVendorsCSV);
router.post('/import', authMiddleware, authorizeRoles('admin'), upload.single('file'), importVendorsCSV);
router.get('/match', authMiddleware, matchVendors);
router.post('/ai-match', authMiddleware, aiVendorMatch);
router.post('/suggestions/:id/feedback', authMiddleware, vendorMatchFeedback);
router.get('/behavior-flags', authMiddleware, authorizeRoles('admin'), getBehaviorFlags);
router.get('/duplicates', authMiddleware, authorizeRoles('admin'), getDuplicateVendors);
router.get('/:vendor/anomalies', authMiddleware, getVendorAnomalies);
router.patch('/:vendor/notes', authMiddleware, authorizeRoles('admin'), updateVendorNotes);
router.get('/:vendor/info', authMiddleware, getVendorInfo);
router.get('/:vendor/predict', authMiddleware, predictVendorBehavior);
router.get('/:vendor/profile', authMiddleware, getVendorAnalytics);
router.patch('/:vendor/country', authMiddleware, authorizeRoles('admin'), updateVendorCountry);
router.patch('/:vendor/profile', authMiddleware, authorizeRoles('admin'), updateVendorProfile);
router.delete('/:vendor', authMiddleware, authorizeRoles('admin'), deleteVendor);
router.get('/:vendor/risk', authMiddleware, authorizeRoles('admin'), getVendorRiskProfile);

module.exports = router;
