const express = require('express');
const router = express.Router();
const { createInvite, acceptInvite } = require('../controllers/inviteController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');
const rateLimit = require('express-rate-limit');

const inviteLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

router.post('/', inviteLimiter, authMiddleware, authorizeRoles('admin'), createInvite);
router.post('/:token/accept', acceptInvite);

module.exports = router;
