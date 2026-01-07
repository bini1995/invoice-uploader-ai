import express from 'express';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import { exportComplianceReport } from '../controllers/activityController.js';
const router = express.Router();

router.get('/report', authMiddleware, authorizeRoles('admin'), exportComplianceReport);

export default router;
