import express from 'express';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import { exportComplianceReport } from '../controllers/activityController.js';
import { anonymizeRecord, listConsentLogs, recordConsent } from '../controllers/complianceController.js';
const router = express.Router();

router.get('/report', authMiddleware, authorizeRoles('admin'), exportComplianceReport);
router.post('/consent', authMiddleware, recordConsent);
router.get('/consent', authMiddleware, authorizeRoles('admin'), listConsentLogs);
router.post('/anonymize', authMiddleware, authorizeRoles('admin'), anonymizeRecord);

export default router;
