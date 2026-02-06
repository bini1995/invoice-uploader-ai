import express from 'express';
import { login, refreshToken, logout, forgotPassword, resetPassword, register, getProfile, updateProfile, authMiddleware } from '../controllers/userController.js';
import { authLimiter } from '../middleware/rateLimit.js';
import validateRequest from '../middleware/validateRequest.js';
import { loginSchema, refreshTokenSchema, registerSchema } from '../validation/authSchemas.js';
import passport, { generateTokensForUser } from '../middleware/passport.js';

const router = express.Router();

router.post('/login', authLimiter, validateRequest({ body: loginSchema }), login);
router.post('/register', authLimiter, validateRequest({ body: registerSchema }), register);
router.post('/refresh', authLimiter, validateRequest({ body: refreshTokenSchema }), refreshToken);
router.post('/logout', authLimiter, validateRequest({ body: refreshTokenSchema }), logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

function getCallbackURL(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/api/auth/google/callback`;
}

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      error: 'Google SSO not configured',
      message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET' 
    });
  }
  const callbackURL = getCallbackURL(req);
  console.log('[Google OAuth] Starting auth flow, callbackURL:', callbackURL);
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account',
    callbackURL
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const callbackURL = getCallbackURL(req);
  console.log('[Google OAuth] Callback received, callbackURL:', callbackURL);
  passport.authenticate('google', { session: false, callbackURL }, (err, user) => {
    if (err || !user) {
      const errorMessage = err?.message || 'Authentication failed';
      console.error('[Google OAuth] Auth failed:', errorMessage, err);
      return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }

    console.log('[Google OAuth] Auth successful for user:', user.email);
    const { token, refreshToken: refToken } = generateTokensForUser(user);

    const params = new URLSearchParams({
      token,
      refreshToken: refToken,
      role: user.role,
      name: user.name || '',
      email: user.email || user.username
    });
    
    res.redirect(`/sso-callback?${params.toString()}`);
  })(req, res, next);
});

router.get('/sso/status', (req, res) => {
  res.json({
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    providers: {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    }
  });
});

export default router;
