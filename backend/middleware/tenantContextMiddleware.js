import pool from '../config/db.js';

const tenantContextMiddleware = (req, res, next) => {
  if (req.path.startsWith('/api/health') || req.path.startsWith('/metrics')) {
    return next();
  }

  const tenantId =
    req.headers['x-tenant-id']
    || req.params.tenantId
    || req.query.tenantId
    || req.body?.tenantId
    || 'default';

  req.tenantId = tenantId;

  return pool.als.run({ tenantId }, () => next());
};

export default tenantContextMiddleware;
