import express from 'express';
import { getAuditTrail } from '../controllers/auditController.js';
import { authMiddleware } from '../controllers/userController.js';
const router = express.Router();

router.get('/', authMiddleware, getAuditTrail);

export default router;
