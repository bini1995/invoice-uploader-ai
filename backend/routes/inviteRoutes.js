import express from 'express';
import { createInvite, acceptInvite } from '../controllers/inviteController.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import rateLimit from 'express-rate-limit';
const router = express.Router();

const inviteLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

router.post('/', inviteLimiter, authMiddleware, authorizeRoles('admin'), createInvite);
router.post('/:token/accept', acceptInvite);

export default router;
