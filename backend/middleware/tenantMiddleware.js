const pool = require('../config/db');

function tenantContext(req, _res, next) {
  const tenantId = req.headers['x-tenant-id'] || req.params.tenantId || 'default';
  pool.als.run({ tenantId }, () => {
    req.tenantId = tenantId;
    next();
  });
}

module.exports = tenantContext;
