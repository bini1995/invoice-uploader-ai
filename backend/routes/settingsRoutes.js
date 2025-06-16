const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, authorizeRoles('admin'), getSettings);
router.patch('/', authMiddleware, authorizeRoles('admin'), updateSettings);

module.exports = router;
