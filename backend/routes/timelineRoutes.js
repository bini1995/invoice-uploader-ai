const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../controllers/userController');
const { getOpsTimeline } = require('../controllers/timelineController');

router.get('/', authMiddleware, getOpsTimeline);

module.exports = router;
