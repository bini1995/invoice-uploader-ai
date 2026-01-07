
import { logActivityDetailed, logActivity } from '../utils/activityLogger.js';
import { maskSensitive } from '../utils/sanitize.js';
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

export { auditLog };
