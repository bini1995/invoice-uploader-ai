const express = require('express');
const router = express.Router();
const { login, refreshToken, logout } = require('../controllers/userController');

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
