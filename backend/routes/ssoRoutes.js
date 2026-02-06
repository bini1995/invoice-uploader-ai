import express from 'express';
import passport, { generateTokensForUser } from '../middleware/passport.js';

const router = express.Router();

function getCallbackURL(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/api/sso/google/callback`;
}

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      error: 'Google SSO not configured',
      message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET' 
    });
  }
  const callbackURL = getCallbackURL(req);
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account',
    callbackURL
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const callbackURL = getCallbackURL(req);
  passport.authenticate('google', { session: false, callbackURL }, (err, user) => {
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
