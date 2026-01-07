import express from 'express';
import { importYaml } from '../controllers/pluginController.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
const router = express.Router();

router.post('/yaml', authMiddleware, authorizeRoles('admin'), importYaml);

export default router;
