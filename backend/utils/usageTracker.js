const pool = require('../config/db');
const logger = require('./logger');

// Usage limits by plan type
const USAGE_LIMITS = {
  free: {
    claims_uploads: 50,
    extractions: 100,
    csv_exports: 10
  },
  starter: {
    claims_uploads: 500,
    extractions: 1000,
    csv_exports: 100
  },
  professional: {
    claims_uploads: 5000,
    extractions: 10000,
    csv_exports: 1000
  },
  enterprise: {
    claims_uploads: -1, // unlimited
    extractions: -1,
    csv_exports: -1
  }
};

// Track usage for a specific action
async function trackUsage(tenantId, userId, action, details = {}) {
  try {
    const timestamp = new Date();
    const month = timestamp.toISOString().slice(0, 7); // YYYY-MM format
    
    // Insert usage record
    await pool.query(
      `INSERT INTO usage_logs (tenant_id, user_id, action, details, created_at, month)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tenantId, userId, action, JSON.stringify(details), timestamp, month]
    );

    // Update monthly usage summary
    await pool.query(
      `INSERT INTO monthly_usage (tenant_id, month, action, count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (tenant_id, month, action)
       DO UPDATE SET count = monthly_usage.count + 1`,
      [tenantId, month, action]
    );

    logger.info({
      tenantId,
      userId,
      action,
      details,
      timestamp: timestamp.toISOString()
    }, 'usage_tracked');

    return { success: true, timestamp };
  } catch (err) {
    logger.error({ err: err.message, tenantId, userId, action }, 'usage_tracking_failed');
    return { success: false, error: err.message };
  }
}

// Check if user has exceeded usage limits
async function checkUsageLimit(tenantId, userId, action) {
  try {
    // Get user's plan
    const planRes = await pool.query(
      'SELECT plan_type FROM users WHERE id = $1',
      [userId]
    );
    
    const planType = planRes.rows[0]?.plan_type || 'free';
    const limits = USAGE_LIMITS[planType];
    
    if (!limits || limits[action] === -1) {
      return { allowed: true, remaining: -1 }; // Unlimited
    }

    // Get current month's usage
    const month = new Date().toISOString().slice(0, 7);
    const usageRes = await pool.query(
      'SELECT count FROM monthly_usage WHERE tenant_id = $1 AND month = $2 AND action = $3',
      [tenantId, month, action]
    );

    const currentUsage = usageRes.rows[0]?.count || 0;
    const remaining = Math.max(0, limits[action] - currentUsage);
    const allowed = remaining > 0;

    logger.info({
      tenantId,
      userId,
      action,
      planType,
      currentUsage,
      limit: limits[action],
      remaining,
      allowed
    }, 'usage_limit_check');

    return { allowed, remaining, currentUsage, limit: limits[action] };
  } catch (err) {
    logger.error({ err: err.message, tenantId, userId, action }, 'usage_limit_check_failed');
    return { allowed: false, error: err.message };
  }
}

// Get usage statistics for a tenant
async function getUsageStats(tenantId, userId, period = 'current_month') {
  try {
    let dateFilter = '';
    let params = [tenantId];
    
    switch (period) {
      case 'current_month':
        dateFilter = "AND month = DATE_TRUNC('month', CURRENT_DATE)::text";
        break;
      case 'last_month':
        dateFilter = "AND month = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::text";
        break;
      case 'last_3_months':
        dateFilter = "AND month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')::text";
        break;
      case 'last_6_months':
        dateFilter = "AND month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')::text";
        break;
      case 'last_year':
        dateFilter = "AND month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 year')::text";
        break;
    }

    const statsRes = await pool.query(
      `SELECT action, SUM(count) as total_count
       FROM monthly_usage 
       WHERE tenant_id = $1 ${dateFilter}
       GROUP BY action`,
      params
    );

    // Get user's plan and limits
    const planRes = await pool.query(
      'SELECT plan_type FROM users WHERE id = $1',
      [userId]
    );
    
    const planType = planRes.rows[0]?.plan_type || 'free';
    const limits = USAGE_LIMITS[planType];

    const stats = {};
    statsRes.rows.forEach(row => {
      stats[row.action] = {
        total: parseInt(row.total_count),
        limit: limits[row.action] || -1,
        remaining: limits[row.action] === -1 ? -1 : Math.max(0, limits[row.action] - parseInt(row.total_count))
      };
    });

    // Add actions with zero usage
    Object.keys(limits).forEach(action => {
      if (!stats[action]) {
        stats[action] = {
          total: 0,
          limit: limits[action],
          remaining: limits[action] === -1 ? -1 : limits[action]
        };
      }
    });

    return stats;
  } catch (err) {
    logger.error({ err: err.message, tenantId, userId, period }, 'usage_stats_failed');
    throw err;
  }
}

// Get detailed usage logs
async function getUsageLogs(tenantId, userId, options = {}) {
  try {
    const { 
      action, 
      startDate, 
      endDate, 
      limit = 100, 
      offset = 0 
    } = options;

    let whereConditions = ['tenant_id = $1'];
    let params = [tenantId];
    let paramIndex = 1;

    if (action) {
      paramIndex++;
      whereConditions.push(`action = $${paramIndex}`);
      params.push(action);
    }

    if (startDate) {
      paramIndex++;
      whereConditions.push(`created_at >= $${paramIndex}`);
      params.push(startDate);
    }

    if (endDate) {
      paramIndex++;
      whereConditions.push(`created_at <= $${paramIndex}`);
      params.push(endDate);
    }

    const whereClause = whereConditions.join(' AND ');

    const logsRes = await pool.query(
      `SELECT ul.*, u.email as user_email
       FROM usage_logs ul
       LEFT JOIN users u ON ul.user_id = u.id
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      [...params, limit, offset]
    );

    const totalRes = await pool.query(
      `SELECT COUNT(*) as total
       FROM usage_logs ul
       WHERE ${whereClause}`,
      params
    );

    return {
      logs: logsRes.rows,
      total: parseInt(totalRes.rows[0].total),
      limit,
      offset
    };
  } catch (err) {
    logger.error({ err: err.message, tenantId, userId, options }, 'usage_logs_failed');
    throw err;
  }
}

// Get usage trends over time
async function getUsageTrends(tenantId, period = 'last_6_months') {
  try {
    let months = 6;
    switch (period) {
      case 'last_3_months': months = 3; break;
      case 'last_6_months': months = 6; break;
      case 'last_year': months = 12; break;
    }

    const trendsRes = await pool.query(
      `SELECT month, action, count
       FROM monthly_usage 
       WHERE tenant_id = $1 
         AND month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${months} months')::text
       ORDER BY month, action`,
      [tenantId]
    );

    // Group by month and action
    const trends = {};
    trendsRes.rows.forEach(row => {
      if (!trends[row.month]) {
        trends[row.month] = {};
      }
      trends[row.month][row.action] = parseInt(row.count);
    });

    return trends;
  } catch (err) {
    logger.error({ err: err.message, tenantId, period }, 'usage_trends_failed');
    throw err;
  }
}

// Reset usage for testing/development
async function resetUsage(tenantId, month = null) {
  try {
    if (month) {
      await pool.query(
        'DELETE FROM monthly_usage WHERE tenant_id = $1 AND month = $2',
        [tenantId, month]
      );
      await pool.query(
        'DELETE FROM usage_logs WHERE tenant_id = $1 AND month = $2',
        [tenantId, month]
      );
    } else {
      await pool.query(
        'DELETE FROM monthly_usage WHERE tenant_id = $1',
        [tenantId]
      );
      await pool.query(
        'DELETE FROM usage_logs WHERE tenant_id = $1',
        [tenantId]
      );
    }

    logger.info({ tenantId, month }, 'usage_reset');
    return { success: true };
  } catch (err) {
    logger.error({ err: err.message, tenantId, month }, 'usage_reset_failed');
    return { success: false, error: err.message };
  }
}

module.exports = {
  trackUsage,
  checkUsageLimit,
  getUsageStats,
  getUsageLogs,
  getUsageTrends,
  resetUsage,
  USAGE_LIMITS
}; 