import express from 'express';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import { getTenantFeatures, updateTenantFeature, getTenantInfo, setTenantInfo } from '../controllers/tenantController.js';
const router = express.Router();

router.get('/:tenantId/features', authMiddleware, authorizeRoles('admin'), getTenantFeatures);
router.patch('/:tenantId/features', authMiddleware, authorizeRoles('admin'), updateTenantFeature);
router.get('/:tenantId/info', authMiddleware, getTenantInfo);
router.post('/:tenantId/info', authMiddleware, authorizeRoles('admin'), setTenantInfo);

export default router;
