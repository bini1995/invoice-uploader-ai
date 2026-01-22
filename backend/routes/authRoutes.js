import express from 'express';
import { login, refreshToken, logout } from '../controllers/userController.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', authLimiter, logout);

export default router;
