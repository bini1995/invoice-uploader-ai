const express = require('express');
const router = express.Router();
const { createInvite, acceptInvite } = require('../controllers/inviteController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.post('/', authMiddleware, authorizeRoles('admin'), createInvite);
router.post('/:token/accept', acceptInvite);

module.exports = router;
