const {
  trackUsage,
  checkUsageLimit,
  getUsageStats,
  getUsageLogs,
  getUsageTrends,
  resetUsage,
  USAGE_LIMITS
} = require('../utils/usageTracker');
const logger = require('../utils/logger');

// Get current usage statistics
exports.getUsageStats = async (req, res) => {
  try {
    const { period = 'current_month' } = req.query;
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stats = await getUsageStats(tenantId, userId, period);
    
    res.json({
      success: true,
      data: stats,
      period,
      limits: USAGE_LIMITS
    });
  } catch (err) {
    logger.error({ err: err.message, userId: req.user?.userId }, 'get_usage_stats_failed');
    res.status(500).json({ message: 'Failed to fetch usage statistics' });
  }
};

// Get detailed usage logs
exports.getUsageLogs = async (req, res) => {
  try {
    const { 
      action, 
      startDate, 
      endDate, 
      limit = 100, 
      offset = 0 
    } = req.query;
    
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const options = {
      action,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const logs = await getUsageLogs(tenantId, userId, options);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    logger.error({ err: err.message, userId: req.user?.userId }, 'get_usage_logs_failed');
    res.status(500).json({ message: 'Failed to fetch usage logs' });
  }
};

// Get usage trends
exports.getUsageTrends = async (req, res) => {
  try {
    const { period = 'last_6_months' } = req.query;
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const trends = await getUsageTrends(tenantId, period);
    
    res.json({
      success: true,
      data: trends,
      period
    });
  } catch (err) {
    logger.error({ err: err.message, userId: req.user?.userId }, 'get_usage_trends_failed');
    res.status(500).json({ message: 'Failed to fetch usage trends' });
  }
};

// Check usage limit for a specific action
exports.checkUsageLimit = async (req, res) => {
  try {
    const { action } = req.params;
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!action) {
      return res.status(400).json({ message: 'Action parameter is required' });
    }

    const limitCheck = await checkUsageLimit(tenantId, userId, action);
    
    res.json({
      success: true,
      data: limitCheck
    });
  } catch (err) {
    logger.error({ err: err.message, userId: req.user?.userId, action: req.params.action }, 'check_usage_limit_failed');
    res.status(500).json({ message: 'Failed to check usage limit' });
  }
};

// Track usage for a specific action
exports.trackUsageAction = async (req, res) => {
  try {
    const { action } = req.params;
    const { details = {} } = req.body;
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!action) {
      return res.status(400).json({ message: 'Action parameter is required' });
    }

    // Check usage limit before tracking
    const limitCheck = await checkUsageLimit(tenantId, userId, action);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        message: 'Usage limit exceeded',
        data: limitCheck
      });
    }

    const result = await trackUsage(tenantId, userId, action, details);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          tracked: true,
          timestamp: result.timestamp,
          remaining: limitCheck.remaining
        }
      });
    } else {
      res.status(500).json({
        message: 'Failed to track usage',
        error: result.error
      });
    }
  } catch (err) {
    logger.error({ err: err.message, userId: req.user?.userId, action: req.params.action }, 'track_usage_failed');
    res.status(500).json({ message: 'Failed to track usage' });
  }
};

// Get usage limits for current plan
exports.getUsageLimits = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user's plan
    const { rows } = await require('../config/db').query(
      'SELECT plan_type FROM users WHERE id = $1',
      [userId]
    );
    
    const planType = rows[0]?.plan_type || 'free';
    const limits = USAGE_LIMITS[planType] || USAGE_LIMITS.free;

    res.json({
      success: true,
      data: {
        planType,
        limits,
        allPlans: USAGE_LIMITS
      }
    });
  } catch (err) {
    logger.error({ err: err.message, userId: req.user?.userId }, 'get_usage_limits_failed');
    res.status(500).json({ message: 'Failed to fetch usage limits' });
  }
};

// Admin endpoint to reset usage (for testing/development)
exports.resetUsage = async (req, res) => {
  try {
    const { month } = req.body;
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is admin (you may want to add admin role checking)
    const { rows } = await require('../config/db').query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    
    if (rows[0]?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await resetUsage(tenantId, month);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Usage reset successfully',
        data: { month }
      });
    } else {
      res.status(500).json({
        message: 'Failed to reset usage',
        error: result.error
      });
    }
  } catch (err) {
    logger.error({ err: err.message, userId: req.user?.userId }, 'reset_usage_failed');
    res.status(500).json({ message: 'Failed to reset usage' });
  }
};

// Get usage analytics dashboard data
exports.getUsageAnalytics = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'default';
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get current month stats
    const currentStats = await getUsageStats(tenantId, userId, 'current_month');
    
    // Get trends for last 6 months
    const trends = await getUsageTrends(tenantId, 'last_6_months');
    
    // Get user's plan
    const { rows } = await require('../config/db').query(
      'SELECT plan_type FROM users WHERE id = $1',
      [userId]
    );
    
    const planType = rows[0]?.plan_type || 'free';
    const limits = USAGE_LIMITS[planType] || USAGE_LIMITS.free;

    // Calculate usage percentages
    const usagePercentages = {};
    Object.keys(currentStats).forEach(action => {
      const stat = currentStats[action];
      if (stat.limit > 0) {
        usagePercentages[action] = Math.round((stat.total / stat.limit) * 100);
      } else {
        usagePercentages[action] = 0;
      }
    });

    res.json({
      success: true,
      data: {
        currentStats,
        trends,
        planType,
        limits,
        usagePercentages,
        analytics: {
          mostUsedAction: Object.keys(currentStats).reduce((a, b) => 
            currentStats[a].total > currentStats[b].total ? a : b
          ),
          totalUsage: Object.values(currentStats).reduce((sum, stat) => sum + stat.total, 0),
          averageUsagePerDay: Math.round(Object.values(currentStats).reduce((sum, stat) => sum + stat.total, 0) / 30)
        }
      }
    });
  } catch (err) {
    logger.error({ err: err.message, userId: req.user?.userId }, 'get_usage_analytics_failed');
    res.status(500).json({ message: 'Failed to fetch usage analytics' });
  }
}; 