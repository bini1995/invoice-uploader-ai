const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedback } = require('../controllers/feedbackController');

router.post('/', submitFeedback);
router.get('/', getFeedback);

module.exports = router;
