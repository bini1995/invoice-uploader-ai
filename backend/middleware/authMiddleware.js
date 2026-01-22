
import passport from 'passport';

const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    req.tenantId = req.headers['x-tenant-id'] || req.tenantId || 'default';
    return next();
  })(req, res, next);
};

export default authMiddleware;
