const { trackUsage, checkUsageLimit } = require('../utils/usageTracker');
const {
  usageLimitExceededCounter,
  usageTrackingCounter,
  usageRemainingGauge,
  usagePercentageGauge
} = require('../metrics');
const logger = require('../utils/logger');

// Define which endpoints should track usage
const USAGE_TRACKING_ENDPOINTS = {
  'POST /api/claims/upload': 'claims_uploads',
  'POST /api/invoices/upload': 'claims_uploads',
  'POST /api/documents/upload': 'claims_uploads',
  'POST /api/ai/extract': 'extractions',
  'POST /api/invoices/extract-fields': 'extractions',
  'POST /api/claims/extract-fields': 'extractions',
  'GET /api/analytics/export/csv': 'csv_exports',
  'GET /api/invoices/export/csv': 'csv_exports',
  'GET /api/claims/export/csv': 'csv_exports',
  'POST /api/analytics/export': 'csv_exports',
  'POST /api/invoices/export': 'csv_exports',
  'POST /api/claims/export': 'csv_exports'
};

// Middleware to track usage
function usageTrackingMiddleware() {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Create a unique key for the endpoint
    const endpointKey = `${req.method} ${req.route?.path || req.path}`;
    const action = USAGE_TRACKING_ENDPOINTS[endpointKey];
    
    if (!action) {
      return next(); // No tracking needed for this endpoint
    }

    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return next(); // No user, skip tracking
    }

    try {
      // Check usage limit before processing
      const limitCheck = await checkUsageLimit(tenantId, userId, action);
      
      if (!limitCheck.allowed) {
        // Update metrics
        usageLimitExceededCounter.inc({ action, plan_type: limitCheck.planType || 'unknown' });
        
        // Return 429 Too Many Requests
        return res.status(429).json({
          error: 'Usage limit exceeded',
          message: `You have exceeded your ${action} limit for this month`,
          data: {
            action,
            currentUsage: limitCheck.currentUsage,
            limit: limitCheck.limit,
            remaining: limitCheck.remaining
          }
        });
      }

      // Track the usage
      const trackingResult = await trackUsage(tenantId, userId, action, {
        endpoint: endpointKey,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      if (trackingResult.success) {
        // Update metrics
        usageTrackingCounter.inc({ action, plan_type: limitCheck.planType || 'unknown' });
        usageRemainingGauge.set({ action, plan_type: limitCheck.planType || 'unknown' }, limitCheck.remaining);
        
        if (limitCheck.limit > 0) {
          const percentage = Math.round((limitCheck.currentUsage / limitCheck.limit) * 100);
          usagePercentageGauge.set({ action, plan_type: limitCheck.planType || 'unknown' }, percentage);
        }

        // Add usage info to response headers
        res.set({
          'X-Usage-Action': action,
          'X-Usage-Remaining': limitCheck.remaining,
          'X-Usage-Limit': limitCheck.limit,
          'X-Usage-Percentage': limitCheck.limit > 0 ? Math.round((limitCheck.currentUsage / limitCheck.limit) * 100) : 0
        });

        logger.info({
          tenantId,
          userId,
          action,
          endpoint: endpointKey,
          remaining: limitCheck.remaining,
          limit: limitCheck.limit
        }, 'usage_tracked_middleware');
      }

    } catch (err) {
      logger.error({
        err: err.message,
        tenantId,
        userId,
        action,
        endpoint: endpointKey
      }, 'usage_tracking_middleware_failed');
      
      // Don't block the request if tracking fails
    }

    // Override res.send to add usage info to response
    res.send = function(data) {
      if (typeof data === 'string') {
        try {
          const jsonData = JSON.parse(data);
          jsonData.usage = {
            action,
            remaining: res.get('X-Usage-Remaining'),
            limit: res.get('X-Usage-Limit'),
            percentage: res.get('X-Usage-Percentage')
          };
          return originalSend.call(this, JSON.stringify(jsonData));
        } catch (e) {
          // Not JSON, send as is
        }
      }
      return originalSend.call(this, data);
    };

    // Override res.json to add usage info
    res.json = function(data) {
      if (data && typeof data === 'object') {
        data.usage = {
          action,
          remaining: res.get('X-Usage-Remaining'),
          limit: res.get('X-Usage-Limit'),
          percentage: res.get('X-Usage-Percentage')
        };
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

// Middleware to check usage limits without tracking
function usageLimitCheckMiddleware() {
  return async (req, res, next) => {
    const endpointKey = `${req.method} ${req.route?.path || req.path}`;
    const action = USAGE_TRACKING_ENDPOINTS[endpointKey];
    
    if (!action) {
      return next();
    }

    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return next();
    }

    try {
      const limitCheck = await checkUsageLimit(tenantId, userId, action);
      
      if (!limitCheck.allowed) {
        usageLimitExceededCounter.inc({ action, plan_type: limitCheck.planType || 'unknown' });
        
        return res.status(429).json({
          error: 'Usage limit exceeded',
          message: `You have exceeded your ${action} limit for this month`,
          data: {
            action,
            currentUsage: limitCheck.currentUsage,
            limit: limitCheck.limit,
            remaining: limitCheck.remaining
          }
        });
      }

      // Add usage info to request for later use
      req.usageInfo = {
        action,
        remaining: limitCheck.remaining,
        limit: limitCheck.limit,
        currentUsage: limitCheck.currentUsage
      };

    } catch (err) {
      logger.error({
        err: err.message,
        tenantId,
        userId,
        action,
        endpoint: endpointKey
      }, 'usage_limit_check_middleware_failed');
    }

    next();
  };
}

module.exports = {
  usageTrackingMiddleware,
  usageLimitCheckMiddleware,
  USAGE_TRACKING_ENDPOINTS
}; 