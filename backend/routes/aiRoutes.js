const express = require('express');
const router = express.Router();
const { categorizeDocument, categoryFeedback } = require('../controllers/aiController');
const { authMiddleware } = require('../controllers/userController');
const { aiLimiter } = require('../middleware/rateLimit');

router.use(aiLimiter);

router.post('/categorize', authMiddleware, categorizeDocument);
router.post('/categorize/:id/feedback', authMiddleware, categoryFeedback);

module.exports = router;
