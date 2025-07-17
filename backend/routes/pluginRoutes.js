const express = require('express');
const router = express.Router();
const { importYaml } = require('../controllers/pluginController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.post('/yaml', authMiddleware, authorizeRoles('admin'), importYaml);

module.exports = router;
