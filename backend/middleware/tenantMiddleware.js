const { Pool } = require('pg');

class TenantMiddleware {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async getTenant(tenantSlug) {
        const query = 'SELECT * FROM tenants WHERE slug = $1 AND is_active = true';
        const result = await this.pool.query(query, [tenantSlug]);
        return result.rows[0];
    }

    middleware() {
        return async (req, res, next) => {
            try {
                const tenantId = req.headers['x-tenant-id'] || 'default';
                
                // Get tenant information
                const tenant = await this.getTenant(tenantId);
                if (!tenant) {
                    return res.status(404).json({
                        error: 'Tenant not found',
                        message: 'The specified tenant does not exist or is inactive'
                    });
                }

                // Add tenant info to request
                req.tenant = tenant;
                
                // Check user permissions for this tenant
                if (req.user) {
                    const userQuery = `
                        SELECT * FROM users 
                        WHERE id = $1 AND tenant_id = $2 AND is_active = true
                    `;
                    const userResult = await this.pool.query(userQuery, [req.user.id, tenant.id]);
                    
                    if (userResult.rows.length === 0) {
                        return res.status(403).json({
                            error: 'Access denied',
                            message: 'User does not have access to this tenant'
                        });
                    }
                    
                    req.user = userResult.rows[0];
                }

                next();
            } catch (error) {
                console.error('Tenant middleware error:', error);
                res.status(500).json({
                    error: 'Tenant validation failed',
                    message: 'Unable to validate tenant access'
                });
            }
        };
    }

    // Middleware for API rate limiting per tenant
    rateLimitMiddleware() {
        return async (req, res, next) => {
            try {
                const tenant = req.tenant;
                if (!tenant) {
                    return next();
                }

                // Check if tenant has exceeded rate limit
                const currentTime = new Date();
                const timeWindow = new Date(currentTime.getTime() - 60000); // 1 minute window

                const rateLimitQuery = `
                    SELECT COUNT(*) as request_count
                    FROM analytics_events 
                    WHERE tenant_id = $1 
                    AND event_type = 'api_request'
                    AND created_at > $2
                `;
                
                const rateLimitResult = await this.pool.query(rateLimitQuery, [tenant.id, timeWindow]);
                const requestCount = parseInt(rateLimitResult.rows[0].request_count);

                if (requestCount >= tenant.api_rate_limit) {
                    return res.status(429).json({
                        error: 'Rate limit exceeded',
                        message: `API rate limit of ${tenant.api_rate_limit} requests per minute exceeded`,
                        retry_after: 60
                    });
                }

                // Log API request
                await this.pool.query(`
                    INSERT INTO analytics_events (tenant_id, event_type, event_data, user_id)
                    VALUES ($1, $2, $3, $4)
                `, [tenant.id, 'api_request', { endpoint: req.path, method: req.method }, req.user?.id]);

                next();
            } catch (error) {
                console.error('Rate limit middleware error:', error);
                next(); // Continue even if rate limiting fails
            }
        };
    }

    // Middleware for subscription tier validation
    subscriptionMiddleware(requiredTier = 'basic') {
        return async (req, res, next) => {
            try {
                const tenant = req.tenant;
                if (!tenant) {
                    return res.status(404).json({ error: 'Tenant not found' });
                }

                const tierHierarchy = {
                    'basic': 1,
                    'professional': 2,
                    'enterprise': 3
                };

                const tenantTier = tierHierarchy[tenant.subscription_tier] || 0;
                const requiredTierLevel = tierHierarchy[requiredTier] || 0;

                if (tenantTier < requiredTierLevel) {
                    return res.status(403).json({
                        error: 'Subscription tier required',
                        message: `This feature requires ${requiredTier} subscription tier or higher`,
                        current_tier: tenant.subscription_tier,
                        required_tier: requiredTier
                    });
                }

                next();
            } catch (error) {
                console.error('Subscription middleware error:', error);
                res.status(500).json({
                    error: 'Subscription validation failed',
                    message: 'Unable to validate subscription tier'
                });
            }
        };
    }
}

module.exports = new TenantMiddleware().middleware();
module.exports.TenantMiddleware = TenantMiddleware;
