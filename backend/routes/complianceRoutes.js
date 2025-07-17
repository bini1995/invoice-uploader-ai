const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../controllers/userController');
const { exportComplianceReport } = require('../controllers/activityController');

router.get('/report', authMiddleware, authorizeRoles('admin'), exportComplianceReport);

module.exports = router;
