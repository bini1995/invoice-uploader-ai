const express = require('express');
const router = express.Router();
const { listNotifications, createNotification, markRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../controllers/userController');

router.get('/', authMiddleware, listNotifications);
router.post('/', authMiddleware, createNotification);
router.patch('/:id/read', authMiddleware, markRead);

module.exports = router;
