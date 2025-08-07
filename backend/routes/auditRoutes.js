const express = require('express');
const router = express.Router();
const { getAuditTrail } = require('../controllers/auditController');
const { authMiddleware } = require('../controllers/userController');

router.get('/', authMiddleware, getAuditTrail);

module.exports = router;
