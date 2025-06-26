const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../controllers/userController');
const { getTenantFeatures, updateTenantFeature, getTenantInfo, setTenantInfo } = require('../controllers/tenantController');

router.get('/:tenantId/features', authMiddleware, authorizeRoles('admin'), getTenantFeatures);
router.patch('/:tenantId/features', authMiddleware, authorizeRoles('admin'), updateTenantFeature);
router.get('/:tenantId/info', authMiddleware, getTenantInfo);
router.post('/:tenantId/info', authMiddleware, authorizeRoles('admin'), setTenantInfo);

module.exports = router;
