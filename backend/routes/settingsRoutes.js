import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin'), getSettings);
router.patch('/', authMiddleware, authorizeRoles('admin'), updateSettings);

export default router;
