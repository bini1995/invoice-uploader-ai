import express from 'express';
import multer from 'multer';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import { uploadLimiter, aiLimiter } from '../middleware/rateLimit.js';
import {
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
} from '../controllers/vendorController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
router.get('/', authMiddleware, listVendors);
router.get('/export', authMiddleware, authorizeRoles('admin'), exportVendorsCSV);
router.post('/import', uploadLimiter, authMiddleware, authorizeRoles('admin'), upload.single('file'), importVendorsCSV);
router.get('/match', authMiddleware, matchVendors);
router.post('/ai-match', aiLimiter, authMiddleware, aiVendorMatch);
router.post('/suggestions/:id/feedback', authMiddleware, vendorMatchFeedback);
router.get('/behavior-flags', authMiddleware, authorizeRoles('admin'), getBehaviorFlags);
router.get('/duplicates', authMiddleware, authorizeRoles('admin'), getDuplicateVendors);
router.get('/:vendor/anomalies', authMiddleware, getVendorAnomalies);
router.patch('/:vendor/notes', authMiddleware, authorizeRoles('admin'), updateVendorNotes);
router.get('/:vendor/info', authMiddleware, getVendorInfo);
router.get('/:vendor/predict', aiLimiter, authMiddleware, predictVendorBehavior);
router.get('/:vendor/profile', authMiddleware, getVendorAnalytics);
router.patch('/:vendor/country', authMiddleware, authorizeRoles('admin'), updateVendorCountry);
router.patch('/:vendor/profile', authMiddleware, authorizeRoles('admin'), updateVendorProfile);
router.delete('/:vendor', authMiddleware, authorizeRoles('admin'), deleteVendor);
router.get('/:vendor/risk', authMiddleware, authorizeRoles('admin'), getVendorRiskProfile);

export default router;
