const { Pool } = require('pg');

class SuperiorAnalyticsController {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async getDashboardData(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const { time_range = '30d' } = req.query;

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Calculate time interval
            const interval = this.getTimeInterval(time_range);

            // Get comprehensive dashboard data
            const [
                claimsStats,
                fraudStats,
                performanceMetrics,
                claimsTrend,
                fraudDetection,
                recentActivity
            ] = await Promise.all([
                this.getClaimsStatistics(tenant.id, interval),
                this.getFraudStatistics(tenant.id, interval),
                this.getPerformanceMetrics(tenant.id, interval),
                this.getClaimsTrend(tenant.id, interval),
                this.getFraudDetectionPerformance(tenant.id, interval),
                this.getRecentActivity(tenant.id)
            ]);

            // Calculate changes from previous period
            const previousInterval = this.getPreviousInterval(interval);
            const [
                previousClaimsStats,
                previousFraudStats,
                previousPerformanceMetrics
            ] = await Promise.all([
                this.getClaimsStatistics(tenant.id, previousInterval),
                this.getFraudStatistics(tenant.id, previousInterval),
                this.getPerformanceMetrics(tenant.id, previousInterval)
            ]);

            const dashboardData = {
                // Current period stats
                totalClaims: claimsStats.totalClaims,
                totalValue: claimsStats.totalValue,
                avgCycleTime: claimsStats.avgCycleTime,
                avgFraudScore: fraudStats.avgFraudScore,
                criticalRisk: fraudStats.criticalRisk,
                highRisk: fraudStats.highRisk,

                // Performance metrics
                npsScore: performanceMetrics.npsScore,
                leakageRate: performanceMetrics.leakageRate,
                complaintRate: performanceMetrics.complaintRate,

                // Changes from previous period
                claimsChange: this.calculatePercentageChange(
                    previousClaimsStats.totalClaims,
                    claimsStats.totalClaims
                ),
                valueChange: this.calculatePercentageChange(
                    previousClaimsStats.totalValue,
                    claimsStats.totalValue
                ),
                cycleTimeChange: this.calculatePercentageChange(
                    previousClaimsStats.avgCycleTime,
                    claimsStats.avgCycleTime,
                    true // Lower is better
                ),
                fraudScoreChange: this.calculatePercentageChange(
                    previousFraudStats.avgFraudScore,
                    fraudStats.avgFraudScore,
                    true // Lower is better
                ),

                // Charts data
                claimsTrend,
                fraudDetection,

                // Recent activity
                recentActivity
            };

            res.json({
                success: true,
                data: dashboardData
            });

        } catch (error) {
            console.error('Dashboard data error:', error);
            res.status(500).json({
                error: 'Failed to retrieve dashboard data',
                details: error.message
            });
        }
    }

    async getClaimsStatistics(tenantId, interval) {
        const query = `
            SELECT 
                COUNT(*) as total_claims,
                COALESCE(SUM(estimated_value), 0) as total_value,
                AVG(cycle_time_hours) as avg_cycle_time,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_claims,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_claims
            FROM claims 
            WHERE tenant_id = $1 
            AND created_at >= $2
        `;

        const result = await this.pool.query(query, [tenantId, interval.start]);
        return result.rows[0];
    }

    async getFraudStatistics(tenantId, interval) {
        const query = `
            SELECT 
                AVG(fraud_score) as avg_fraud_score,
                COUNT(CASE WHEN fraud_score >= 0.8 THEN 1 END) as critical_risk,
                COUNT(CASE WHEN fraud_score >= 0.6 AND fraud_score < 0.8 THEN 1 END) as high_risk,
                COUNT(CASE WHEN fraud_score >= 0.4 AND fraud_score < 0.6 THEN 1 END) as medium_risk,
                COUNT(CASE WHEN fraud_score < 0.4 THEN 1 END) as low_risk
            FROM claims 
            WHERE tenant_id = $1 
            AND created_at >= $2
        `;

        const result = await this.pool.query(query, [tenantId, interval.start]);
        return result.rows[0];
    }

    async getPerformanceMetrics(tenantId, interval) {
        // Calculate NPS Score (simplified calculation)
        const npsQuery = `
            SELECT 
                COUNT(CASE WHEN fraud_score < 0.3 THEN 1 END) as promoters,
                COUNT(CASE WHEN fraud_score >= 0.3 AND fraud_score < 0.6 THEN 1 END) as passives,
                COUNT(CASE WHEN fraud_score >= 0.6 THEN 1 END) as detractors,
                COUNT(*) as total_claims
            FROM claims 
            WHERE tenant_id = $1 
            AND created_at >= $2
        `;

        const npsResult = await this.pool.query(npsQuery, [tenantId, interval.start]);
        const npsData = npsResult.rows[0];

        // Calculate NPS Score
        const totalClaims = parseInt(npsData.total_claims) || 1;
        const promoters = parseInt(npsData.promoters) || 0;
        const detractors = parseInt(npsData.detractors) || 0;
        const npsScore = Math.round(((promoters - detractors) / totalClaims) * 100);

        // Calculate leakage rate (claims with high fraud scores that were approved)
        const leakageQuery = `
            SELECT 
                COUNT(CASE WHEN fraud_score > 0.6 AND status = 'closed' THEN 1 END) as leaked_claims,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as total_closed
            FROM claims 
            WHERE tenant_id = $1 
            AND created_at >= $2
        `;

        const leakageResult = await this.pool.query(leakageQuery, [tenantId, interval.start]);
        const leakageData = leakageResult.rows[0];

        const totalClosed = parseInt(leakageData.total_closed) || 1;
        const leakedClaims = parseInt(leakageData.leaked_claims) || 0;
        const leakageRate = (leakedClaims / totalClosed) * 100;

        // Calculate complaint rate (based on fraud events)
        const complaintQuery = `
            SELECT COUNT(*) as fraud_events
            FROM fraud_events 
            WHERE tenant_id = $1 
            AND created_at >= $2
        `;

        const complaintResult = await this.pool.query(complaintQuery, [tenantId, interval.start]);
        const fraudEvents = parseInt(complaintResult.rows[0].fraud_events) || 0;
        const totalClaims = parseInt(npsData.total_claims) || 1;
        const complaintRate = (fraudEvents / totalClaims) * 100;

        return {
            npsScore,
            leakageRate,
            complaintRate
        };
    }

    async getClaimsTrend(tenantId, interval) {
        const query = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as claims,
                COALESCE(SUM(estimated_value), 0) as value
            FROM claims 
            WHERE tenant_id = $1 
            AND created_at >= $2
            GROUP BY DATE(created_at)
            ORDER BY date
        `;

        const result = await this.pool.query(query, [tenantId, interval.start]);
        return result.rows;
    }

    async getFraudDetectionPerformance(tenantId, interval) {
        const query = `
            SELECT 
                event_type as pattern,
                COUNT(*) as detected,
                AVG(ai_confidence) as avg_confidence
            FROM fraud_events 
            WHERE tenant_id = $1 
            AND created_at >= $2
            GROUP BY event_type
            ORDER BY detected DESC
        `;

        const result = await this.pool.query(query, [tenantId, interval.start]);
        
        // Add missed fraud (simplified calculation)
        return result.rows.map(row => ({
            ...row,
            missed: Math.round(row.detected * 0.1) // Assume 10% missed
        }));
    }

    async getRecentActivity(tenantId) {
        const query = `
            SELECT 
                event_type,
                event_data,
                created_at,
                user_id
            FROM analytics_events 
            WHERE tenant_id = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        `;

        const result = await this.pool.query(query, [tenantId]);
        
        return result.rows.map(row => ({
            type: row.event_type,
            description: this.formatActivityDescription(row.event_type, row.event_data),
            timestamp: this.formatTimestamp(row.created_at)
        }));
    }

    formatActivityDescription(eventType, eventData) {
        const data = eventData || {};
        
        switch (eventType) {
            case 'claim_created':
                return `New claim created: ${data.claim_type || 'Unknown type'}`;
            case 'fraud_detected':
                return `Fraud detected in claim: Score ${data.fraud_score || 'Unknown'}`;
            case 'claim_updated':
                return `Claim status updated to: ${data.status || 'Unknown'}`;
            case 'document_uploaded':
                return `Document uploaded to claim`;
            default:
                return `Activity: ${eventType}`;
        }
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    calculatePercentageChange(previous, current, lowerIsBetter = false) {
        if (!previous || previous === 0) return 0;
        
        const change = ((current - previous) / previous) * 100;
        
        if (lowerIsBetter) {
            return -change; // Invert for metrics where lower is better
        }
        
        return change;
    }

    getTimeInterval(timeRange) {
        const now = new Date();
        let start;
        
        switch (timeRange) {
            case '7d':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        
        return { start, end: now };
    }

    getPreviousInterval(currentInterval) {
        const duration = currentInterval.end - currentInterval.start;
        const previousEnd = currentInterval.start;
        const previousStart = new Date(previousEnd.getTime() - duration);
        
        return { start: previousStart, end: previousEnd };
    }

    async getTenant(tenantSlug) {
        const query = 'SELECT * FROM tenants WHERE slug = $1 AND is_active = true';
        const result = await this.pool.query(query, [tenantSlug]);
        return result.rows[0];
    }
}

module.exports = SuperiorAnalyticsController; 