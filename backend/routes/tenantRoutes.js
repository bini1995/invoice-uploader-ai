const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../controllers/userController');
const { getTenantFeatures, updateTenantFeature } = require('../controllers/tenantController');

router.get('/:tenantId/features', authMiddleware, authorizeRoles('admin'), getTenantFeatures);
router.patch('/:tenantId/features', authMiddleware, authorizeRoles('admin'), updateTenantFeature);

module.exports = router;
