import express from 'express';
import { getSmartSuggestions, retrain, askDocument } from '../controllers/agentController.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
const router = express.Router();

router.post('/suggest', authMiddleware, getSmartSuggestions);
router.post('/retrain', authMiddleware, authorizeRoles('admin'), retrain);
router.post('/ask', authMiddleware, askDocument);

export default router;

