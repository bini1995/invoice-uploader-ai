import express from 'express';
import { getActivityLogs } from '../controllers/activityController.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin'), getActivityLogs);

export default router;
