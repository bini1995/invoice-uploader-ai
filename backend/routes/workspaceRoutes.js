import express from 'express';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import { getTenantInfo, setTenantInfo, getTenantFeatures, updateTenantFeature } from '../controllers/tenantController.js';
const router = express.Router();

router.get('/:tenantId/info', authMiddleware, getTenantInfo);
router.post('/:tenantId/info', authMiddleware, authorizeRoles('admin'), setTenantInfo);
router.get('/:tenantId/features', authMiddleware, getTenantFeatures);
router.patch('/:tenantId/features', authMiddleware, authorizeRoles('admin'), updateTenantFeature);

export default router;
