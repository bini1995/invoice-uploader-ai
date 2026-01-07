import express from 'express';
import { listNotifications, createNotification, markRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../controllers/userController.js';
const router = express.Router();

router.get('/', authMiddleware, listNotifications);
router.post('/', authMiddleware, createNotification);
router.patch('/:id/read', authMiddleware, markRead);

export default router;
