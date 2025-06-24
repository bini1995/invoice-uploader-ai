const { logActivityDetailed } = require('../utils/activityLogger');

function auditLog(req, res, next) {
  res.on('finish', () => {
    if (!req.originalUrl.startsWith('/api')) return;
    const tenantId = req.params?.tenantId || req.headers['x-tenant-id'] || 'default';
    const userId = req.user?.userId || null;
    const username = req.user?.username || null;
    const action = `${req.method} ${req.originalUrl}`;
    logActivityDetailed(tenantId, userId, username, action);
  });
  next();
}

module.exports = { auditLog };
