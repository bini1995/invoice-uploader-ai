import express from 'express';
import passport, { generateTokensForUser } from '../config/passport.js';

const router = express.Router();

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      error: 'Google SSO not configured',
      message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET' 
    });
  }
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      const errorMessage = err?.message || 'Authentication failed';
      return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }

    const { token, refreshToken } = generateTokensForUser(user);

    const params = new URLSearchParams({
      token,
      refreshToken,
      role: user.role,
      name: user.name || '',
      email: user.email || user.username
    });
    
    res.redirect(`/sso-callback?${params.toString()}`);
  })(req, res, next);
});

router.get('/status', (req, res) => {
  res.json({
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    providers: {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    }
  });
});

export default router;
