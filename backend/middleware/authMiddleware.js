
import passport from 'passport';
import pool from '../config/db.js';

const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const tokenTenantId = user.tenantId || user.tenant_id;
    if (!tokenTenantId) {
      return res.status(403).json({ error: 'Tenant not found in token' });
    }
    const requestedTenantId = req.headers['x-tenant-id'];
    if (requestedTenantId && requestedTenantId !== tokenTenantId) {
      return res.status(403).json({ error: 'Tenant access forbidden' });
    }
    req.user = user;
    req.tenantId = tokenTenantId;
    const store = pool.als.getStore();
    if (store) {
      store.tenantId = tokenTenantId;
    }
    return next();
  })(req, res, next);
};

export default authMiddleware;
