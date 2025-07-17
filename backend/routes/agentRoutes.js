const express = require('express');
const router = express.Router();
const { getSmartSuggestions, retrain, askDocument } = require('../controllers/agentController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.post('/suggest', authMiddleware, getSmartSuggestions);
router.post('/retrain', authMiddleware, authorizeRoles('admin'), retrain);
router.post('/ask', authMiddleware, askDocument);

module.exports = router;

