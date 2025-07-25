const express = require('express');
const router = express.Router();
const { recordEvent } = require('../controllers/eventController');
const { authMiddleware } = require('../controllers/userController');

router.post('/', authMiddleware, recordEvent);

module.exports = router;
