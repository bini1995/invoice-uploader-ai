const express = require('express');
const router = express.Router();
const { categorizeDocument } = require('../controllers/aiController');
const { authMiddleware } = require('../controllers/userController');

router.post('/categorize', authMiddleware, categorizeDocument);

module.exports = router;
