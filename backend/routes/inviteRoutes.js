import express from 'express';
import { createInvite, acceptInvite } from '../controllers/inviteController.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import rateLimit from 'express-rate-limit';
const router = express.Router();

const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many invites created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip,
});

router.post('/', authMiddleware, authorizeRoles('admin'), inviteLimiter, createInvite);
router.post('/:token/accept', acceptInvite);

export default router;
