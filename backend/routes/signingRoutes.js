const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../controllers/userController');
const { createSigningRequest } = require('../controllers/signingController');

router.post('/:id/start', authMiddleware, createSigningRequest);

module.exports = router;
