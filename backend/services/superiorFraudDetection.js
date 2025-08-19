const { Pool } = require('pg');
const crypto = require('crypto');
const { OpenAI } = require('openai');

class SuperiorFraudDetection {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Fraud detection patterns
        this.fraudPatterns = {
            duplicate_claims: {
                weight: 0.8,
                description: 'Multiple claims with similar characteristics'
            },
            unusual_amounts: {
                weight: 0.7,
                description: 'Claims with unusually high or round amounts'
            },
            rapid_submission: {
                weight: 0.6,
                description: 'Claims submitted in rapid succession'
            },
            document_anomalies: {
                weight: 0.9,
                description: 'Suspicious document characteristics'
            },
            behavioral_patterns: {
                weight: 0.8,
                description: 'Unusual user behavior patterns'
            },
            geographic_anomalies: {
                weight: 0.7,
                description: 'Claims from unusual geographic locations'
            },
            timing_patterns: {
                weight: 0.6,
                description: 'Suspicious timing of claim submissions'
            }
        };
    }

    async analyzeClaim(claimId, tenantId) {
        try {
            // Get claim data
            const claim = await this.getClaimData(claimId);
            if (!claim) throw new Error('Claim not found');

            // Run comprehensive fraud analysis
            const analysis = await this.runFraudAnalysis(claim, tenantId);
            
            // Calculate overall fraud score
            const fraudScore = this.calculateFraudScore(analysis);
            
            // Determine risk level
            const riskLevel = this.determineRiskLevel(fraudScore);
            
            // Generate AI insights
            const aiInsights = await this.generateAIInsights(claim, analysis);
            
            // Update claim with fraud analysis
            await this.updateClaimFraudData(claimId, fraudScore, riskLevel, aiInsights);
            
            // Log fraud events if suspicious
            if (fraudScore > 0.3) {
                await this.logFraudEvents(claimId, tenantId, analysis);
            }
            
            return {
                fraudScore,
                riskLevel,
                analysis,
                aiInsights,
                recommendations: this.generateRecommendations(analysis, fraudScore)
            };
        } catch (error) {
            console.error('Fraud detection error:', error);
            throw error;
        }
    }

    async getClaimData(claimId) {
        const query = `
            SELECT c.*, u.email as submitter_email, u.first_name, u.last_name
            FROM claims c
            LEFT JOIN users u ON c.submitted_by = u.id
            WHERE c.id = $1
        `;
        const result = await this.pool.query(query, [claimId]);
        return result.rows[0];
    }

    async runFraudAnalysis(claim, tenantId) {
        const analysis = {
            duplicate_claims: await this.checkDuplicateClaims(claim, tenantId),
            unusual_amounts: this.checkUnusualAmounts(claim),
            rapid_submission: await this.checkRapidSubmission(claim, tenantId),
            document_anomalies: await this.checkDocumentAnomalies(claim.id),
            behavioral_patterns: await this.checkBehavioralPatterns(claim, tenantId),
            geographic_anomalies: await this.checkGeographicAnomalies(claim, tenantId),
            timing_patterns: this.checkTimingPatterns(claim)
        };
        
        return analysis;
    }

    async checkDuplicateClaims(claim, tenantId) {
        const query = `
            SELECT COUNT(*) as count, AVG(estimated_value) as avg_amount
            FROM claims 
            WHERE tenant_id = $1 
            AND policyholder_name = $2 
            AND claim_type = $3
            AND created_at > NOW() - INTERVAL '30 days'
            AND id != $4
        `;
        
        const result = await this.pool.query(query, [
            tenantId, 
            claim.policyholder_name, 
            claim.claim_type, 
            claim.id
        ]);
        
        const duplicateCount = parseInt(result.rows[0].count);
        const avgAmount = parseFloat(result.rows[0].avg_amount) || 0;
        
        return {
            score: Math.min(duplicateCount * 0.3, 1.0),
            details: {
                duplicate_count: duplicateCount,
                average_amount: avgAmount,
                amount_variance: avgAmount > 0 ? Math.abs(claim.estimated_value - avgAmount) / avgAmount : 0
            }
        };
    }

    checkUnusualAmounts(claim) {
        const amount = claim.estimated_value || 0;
        let score = 0;
        const details = {};
        
        // Check for round numbers
        if (amount % 1000 === 0 && amount > 10000) {
            score += 0.3;
            details.round_number = true;
        }
        
        // Check for unusually high amounts
        if (amount > 100000) {
            score += 0.2;
            details.high_amount = true;
        }
        
        // Check for suspicious amounts (like 9999, 99999)
        if (amount.toString().match(/^9+$/)) {
            score += 0.4;
            details.suspicious_pattern = true;
        }
        
        return {
            score: Math.min(score, 1.0),
            details
        };
    }

    async checkRapidSubmission(claim, tenantId) {
        const query = `
            SELECT COUNT(*) as count
            FROM claims 
            WHERE tenant_id = $1 
            AND submitted_by = $2
            AND created_at > NOW() - INTERVAL '1 hour'
            AND id != $3
        `;
        
        const result = await this.pool.query(query, [
            tenantId, 
            claim.submitted_by, 
            claim.id
        ]);
        
        const rapidCount = parseInt(result.rows[0].count);
        
        return {
            score: Math.min(rapidCount * 0.4, 1.0),
            details: {
                rapid_submissions: rapidCount,
                time_window: '1 hour'
            }
        };
    }

    async checkDocumentAnomalies(claimId) {
        const query = `
            SELECT d.*, c.claim_type
            FROM documents d
            JOIN claims c ON d.claim_id = c.id
            WHERE d.claim_id = $1
        `;
        
        const result = await this.pool.query(query, [claimId]);
        const documents = result.rows;
        
        let score = 0;
        const details = {
            document_count: documents.length,
            suspicious_documents: []
        };
        
        for (const doc of documents) {
            // Check file size anomalies
            if (doc.file_size > 10 * 1024 * 1024) { // > 10MB
                score += 0.2;
                details.suspicious_documents.push({
                    filename: doc.filename,
                    reason: 'Large file size',
                    size: doc.file_size
                });
            }
            
            // Check for suspicious file types
            const suspiciousTypes = ['exe', 'bat', 'cmd', 'scr'];
            const fileExt = doc.filename.split('.').pop().toLowerCase();
            if (suspiciousTypes.includes(fileExt)) {
                score += 0.5;
                details.suspicious_documents.push({
                    filename: doc.filename,
                    reason: 'Suspicious file type',
                    type: fileExt
                });
            }
        }
        
        return {
            score: Math.min(score, 1.0),
            details
        };
    }

    async checkBehavioralPatterns(claim, tenantId) {
        const query = `
            SELECT 
                COUNT(*) as total_claims,
                AVG(estimated_value) as avg_value,
                STDDEV(estimated_value) as value_stddev,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
            FROM claims 
            WHERE tenant_id = $1 
            AND submitted_by = $2
            AND created_at > NOW() - INTERVAL '90 days'
        `;
        
        const result = await this.pool.query(query, [tenantId, claim.submitted_by]);
        const stats = result.rows[0];
        
        let score = 0;
        const details = {
            total_claims: parseInt(stats.total_claims),
            average_value: parseFloat(stats.avg_value) || 0,
            rejection_rate: stats.total_claims > 0 ? stats.rejected_count / stats.total_claims : 0
        };
        
        // High rejection rate
        if (details.rejection_rate > 0.5) {
            score += 0.4;
        }
        
        // Unusual claim frequency
        if (details.total_claims > 20) {
            score += 0.3;
        }
        
        return {
            score: Math.min(score, 1.0),
            details
        };
    }

    async checkGeographicAnomalies(claim, tenantId) {
        // This would integrate with geolocation services
        // For now, return a basic check
        return {
            score: 0.1, // Low risk by default
            details: {
                location_check: 'basic',
                notes: 'Geographic analysis requires external service integration'
            }
        };
    }

    checkTimingPatterns(claim) {
        const submissionTime = new Date(claim.created_at);
        const hour = submissionTime.getHours();
        const dayOfWeek = submissionTime.getDay();
        
        let score = 0;
        const details = {
            submission_hour: hour,
            day_of_week: dayOfWeek,
            unusual_timing: false
        };
        
        // Check for unusual submission times (late night/early morning)
        if (hour < 6 || hour > 22) {
            score += 0.2;
            details.unusual_timing = true;
        }
        
        // Check for weekend submissions
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            score += 0.1;
            details.weekend_submission = true;
        }
        
        return {
            score: Math.min(score, 1.0),
            details
        };
    }

    calculateFraudScore(analysis) {
        let totalScore = 0;
        let totalWeight = 0;
        
        for (const [pattern, config] of Object.entries(this.fraudPatterns)) {
            if (analysis[pattern]) {
                totalScore += analysis[pattern].score * config.weight;
                totalWeight += config.weight;
            }
        }
        
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    determineRiskLevel(fraudScore) {
        if (fraudScore >= 0.8) return 'critical';
        if (fraudScore >= 0.6) return 'high';
        if (fraudScore >= 0.4) return 'medium';
        if (fraudScore >= 0.2) return 'low';
        return 'minimal';
    }

    async generateAIInsights(claim, analysis) {
        try {
            const prompt = `
                Analyze this insurance claim for potential fraud indicators:
                
                Claim Details:
                - Type: ${claim.claim_type}
                - Amount: $${claim.estimated_value}
                - Policyholder: ${claim.policyholder_name}
                - Status: ${claim.status}
                
                Fraud Analysis Results:
                ${JSON.stringify(analysis, null, 2)}
                
                Provide insights and recommendations in JSON format with the following structure:
                {
                    "risk_factors": ["list of key risk factors"],
                    "recommendations": ["list of specific recommendations"],
                    "confidence_level": "high/medium/low",
                    "summary": "brief summary of findings"
                }
            `;
            
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            });
            
            const response = completion.choices[0].message.content;
            return JSON.parse(response);
        } catch (error) {
            console.error('AI insights generation error:', error);
            return {
                risk_factors: ["AI analysis unavailable"],
                recommendations: ["Manual review recommended"],
                confidence_level: "low",
                summary: "AI analysis failed, manual review required"
            };
        }
    }

    async updateClaimFraudData(claimId, fraudScore, riskLevel, aiInsights) {
        const query = `
            UPDATE claims 
            SET fraud_score = $1, risk_level = $2, ai_insights = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
        `;
        
        await this.pool.query(query, [fraudScore, riskLevel, aiInsights, claimId]);
    }

    async logFraudEvents(claimId, tenantId, analysis) {
        for (const [pattern, data] of Object.entries(analysis)) {
            if (data.score > 0.3) {
                const query = `
                    INSERT INTO fraud_events (claim_id, tenant_id, event_type, severity, description, ai_confidence, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `;
                
                await this.pool.query(query, [
                    claimId,
                    tenantId,
                    pattern,
                    data.score > 0.7 ? 'high' : data.score > 0.5 ? 'medium' : 'low',
                    this.fraudPatterns[pattern]?.description || 'Suspicious activity detected',
                    data.score,
                    data.details
                ]);
            }
        }
    }

    generateRecommendations(analysis, fraudScore) {
        const recommendations = [];
        
        if (fraudScore > 0.8) {
            recommendations.push('Immediate manual review required');
            recommendations.push('Consider temporary suspension of account');
            recommendations.push('Notify fraud investigation team');
        } else if (fraudScore > 0.6) {
            recommendations.push('Enhanced review process recommended');
            recommendations.push('Request additional documentation');
            recommendations.push('Monitor for similar patterns');
        } else if (fraudScore > 0.4) {
            recommendations.push('Standard review process');
            recommendations.push('Verify documentation authenticity');
        } else {
            recommendations.push('Proceed with normal processing');
        }
        
        return recommendations;
    }

    async getFraudStatistics(tenantId, timeRange = '30 days') {
        const query = `
            SELECT 
                COUNT(*) as total_claims,
                AVG(fraud_score) as avg_fraud_score,
                COUNT(CASE WHEN fraud_score > 0.8 THEN 1 END) as critical_risk,
                COUNT(CASE WHEN fraud_score > 0.6 THEN 1 END) as high_risk,
                COUNT(CASE WHEN fraud_score > 0.4 THEN 1 END) as medium_risk
            FROM claims 
            WHERE tenant_id = $1 
            AND created_at > NOW() - INTERVAL $2
        `;
        
        const result = await this.pool.query(query, [tenantId, timeRange]);
        return result.rows[0];
    }
}

module.exports = SuperiorFraudDetection; 