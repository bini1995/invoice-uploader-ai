const { logActivityDetailed, logActivity } = require('../utils/activityLogger');
const { maskSensitive } = require('../utils/sanitize');

function auditLog(req, res, next) {
  res.on('finish', () => {
    if (!req.originalUrl.startsWith('/api')) return;
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId || null;
    const username = req.user?.username || null;
    const action = `${req.method} ${req.originalUrl}`;
    const maskedAction = maskSensitive(action);
    logActivityDetailed(tenantId, userId, username, maskedAction);
    if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      logActivity(userId, maskedAction, null, username);
    }
  });
  next();
}

module.exports = { auditLog };
