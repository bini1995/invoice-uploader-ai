import express from 'express';
import { login, refreshToken, logout, forgotPassword, resetPassword } from '../controllers/userController.js';
import { authLimiter } from '../middleware/rateLimit.js';
import validateRequest from '../middleware/validateRequest.js';
import { loginSchema, refreshTokenSchema } from '../validation/authSchemas.js';

const router = express.Router();

router.post('/login', authLimiter, validateRequest({ body: loginSchema }), login);
router.post('/refresh', authLimiter, validateRequest({ body: refreshTokenSchema }), refreshToken);
router.post('/logout', authLimiter, validateRequest({ body: refreshTokenSchema }), logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
