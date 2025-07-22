const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, authorizeRoles('admin'), getActivityLogs);

module.exports = router;
