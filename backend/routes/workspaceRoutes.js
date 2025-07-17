const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../controllers/userController');
const { getTenantInfo, setTenantInfo, getTenantFeatures, updateTenantFeature } = require('../controllers/tenantController');

router.get('/:tenantId/info', authMiddleware, getTenantInfo);
router.post('/:tenantId/info', authMiddleware, authorizeRoles('admin'), setTenantInfo);
router.get('/:tenantId/features', authMiddleware, getTenantFeatures);
router.patch('/:tenantId/features', authMiddleware, authorizeRoles('admin'), updateTenantFeature);

module.exports = router;
