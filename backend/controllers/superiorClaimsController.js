const { Pool } = require('pg');
const SuperiorFraudDetection = require('../services/superiorFraudDetection');
const { OpenAI } = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

class SuperiorClaimsController {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        this.fraudDetection = new SuperiorFraudDetection();
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Configure multer for file uploads
        this.upload = multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    const uploadDir = `uploads/${req.headers['x-tenant-id'] || 'default'}`;
                    fs.mkdir(uploadDir, { recursive: true }).then(() => {
                        cb(null, uploadDir);
                    }).catch(cb);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
                }
            }),
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB limit
                files: 10 // Max 10 files per request
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain'
                ];
                
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type'), false);
                }
            }
        });
    }

    // Create a new claim with advanced features
    async createClaim(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const {
                policy_number,
                policyholder_name,
                claim_type,
                estimated_value,
                description,
                priority = 3
            } = req.body;

            // Validate required fields
            if (!policy_number || !policyholder_name || !claim_type) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['policy_number', 'policyholder_name', 'claim_type']
                });
            }

            // Generate unique claim number
            const claimNumber = await this.generateClaimNumber(tenantId);

            // Get tenant info
            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Create claim
            const query = `
                INSERT INTO claims (
                    tenant_id, claim_number, policy_number, policyholder_name, 
                    claim_type, estimated_value, priority, submitted_by, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const result = await this.pool.query(query, [
                tenant.id,
                claimNumber,
                policy_number,
                policyholder_name,
                claim_type,
                estimated_value,
                priority,
                req.user.id,
                'submitted'
            ]);

            const claim = result.rows[0];

            // Run fraud detection analysis
            const fraudAnalysis = await this.fraudDetection.analyzeClaim(claim.id, tenant.id);

            // Log analytics event
            await this.logAnalyticsEvent(tenant.id, 'claim_created', {
                claim_id: claim.id,
                claim_type,
                estimated_value,
                fraud_score: fraudAnalysis.fraudScore
            }, req.user.id);

            res.status(201).json({
                success: true,
                claim: {
                    ...claim,
                    fraud_analysis: fraudAnalysis
                },
                message: 'Claim created successfully'
            });

        } catch (error) {
            console.error('Create claim error:', error);
            res.status(500).json({
                error: 'Failed to create claim',
                details: error.message
            });
        }
    }

    // Get claims with advanced filtering and pagination
    async getClaims(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const {
                page = 1,
                limit = 20,
                status,
                claim_type,
                priority,
                risk_level,
                fraud_score_min,
                fraud_score_max,
                date_from,
                date_to,
                assigned_to,
                search
            } = req.query;

            const offset = (page - 1) * limit;
            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Build dynamic query
            let query = `
                SELECT 
                    c.*,
                    u.first_name as assignee_first_name,
                    u.last_name as assignee_last_name,
                    u.email as assignee_email,
                    COUNT(d.id) as document_count,
                    COUNT(fe.id) as fraud_events_count
                FROM claims c
                LEFT JOIN users u ON c.assigned_to = u.id
                LEFT JOIN documents d ON c.id = d.claim_id
                LEFT JOIN fraud_events fe ON c.id = fe.claim_id
                WHERE c.tenant_id = $1
            `;

            const params = [tenant.id];
            let paramIndex = 2;

            // Add filters
            if (status) {
                query += ` AND c.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            if (claim_type) {
                query += ` AND c.claim_type = $${paramIndex}`;
                params.push(claim_type);
                paramIndex++;
            }

            if (priority) {
                query += ` AND c.priority = $${paramIndex}`;
                params.push(priority);
                paramIndex++;
            }

            if (risk_level) {
                query += ` AND c.risk_level = $${paramIndex}`;
                params.push(risk_level);
                paramIndex++;
            }

            if (fraud_score_min !== undefined) {
                query += ` AND c.fraud_score >= $${paramIndex}`;
                params.push(fraud_score_min);
                paramIndex++;
            }

            if (fraud_score_max !== undefined) {
                query += ` AND c.fraud_score <= $${paramIndex}`;
                params.push(fraud_score_max);
                paramIndex++;
            }

            if (date_from) {
                query += ` AND c.created_at >= $${paramIndex}`;
                params.push(date_from);
                paramIndex++;
            }

            if (date_to) {
                query += ` AND c.created_at <= $${paramIndex}`;
                params.push(date_to);
                paramIndex++;
            }

            if (assigned_to) {
                query += ` AND c.assigned_to = $${paramIndex}`;
                params.push(assigned_to);
                paramIndex++;
            }

            if (search) {
                query += ` AND (
                    c.policyholder_name ILIKE $${paramIndex} OR 
                    c.policy_number ILIKE $${paramIndex} OR 
                    c.claim_number ILIKE $${paramIndex}
                )`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            query += ` GROUP BY c.id, u.first_name, u.last_name, u.email
                       ORDER BY c.created_at DESC
                       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

            params.push(limit, offset);

            const result = await this.pool.query(query, params);

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) as total
                FROM claims c
                WHERE c.tenant_id = $1
            `;
            const countResult = await this.pool.query(countQuery, [tenant.id]);
            const total = parseInt(countResult.rows[0].total);

            res.json({
                success: true,
                claims: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Get claims error:', error);
            res.status(500).json({
                error: 'Failed to retrieve claims',
                details: error.message
            });
        }
    }

    // Get single claim with full details
    async getClaim(req, res) {
        try {
            const { claimId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const query = `
                SELECT 
                    c.*,
                    u1.first_name as assignee_first_name,
                    u1.last_name as assignee_last_name,
                    u1.email as assignee_email,
                    u2.first_name as submitter_first_name,
                    u2.last_name as submitter_last_name,
                    u2.email as submitter_email
                FROM claims c
                LEFT JOIN users u1 ON c.assigned_to = u1.id
                LEFT JOIN users u2 ON c.submitted_by = u2.id
                WHERE c.id = $1 AND c.tenant_id = $2
            `;

            const result = await this.pool.query(query, [claimId, tenant.id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Claim not found' });
            }

            const claim = result.rows[0];

            // Get documents
            const documentsQuery = `
                SELECT * FROM documents 
                WHERE claim_id = $1 
                ORDER BY created_at DESC
            `;
            const documentsResult = await this.pool.query(documentsQuery, [claimId]);
            claim.documents = documentsResult.rows;

            // Get fraud events
            const fraudEventsQuery = `
                SELECT * FROM fraud_events 
                WHERE claim_id = $1 
                ORDER BY created_at DESC
            `;
            const fraudEventsResult = await this.pool.query(fraudEventsQuery, [claimId]);
            claim.fraud_events = fraudEventsResult.rows;

            // Get comments
            const commentsQuery = `
                SELECT cc.*, u.first_name, u.last_name, u.email
                FROM claim_comments cc
                LEFT JOIN users u ON cc.user_id = u.id
                WHERE cc.claim_id = $1 
                ORDER BY cc.created_at DESC
            `;
            const commentsResult = await this.pool.query(commentsQuery, [claimId]);
            claim.comments = commentsResult.rows;

            res.json({
                success: true,
                claim
            });

        } catch (error) {
            console.error('Get claim error:', error);
            res.status(500).json({
                error: 'Failed to retrieve claim',
                details: error.message
            });
        }
    }

    // Update claim status and workflow
    async updateClaim(req, res) {
        try {
            const { claimId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const {
                status,
                workflow_step,
                assigned_to,
                actual_value,
                priority,
                ai_insights
            } = req.body;

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Get current claim
            const currentClaim = await this.pool.query(
                'SELECT * FROM claims WHERE id = $1 AND tenant_id = $2',
                [claimId, tenant.id]
            );

            if (currentClaim.rows.length === 0) {
                return res.status(404).json({ error: 'Claim not found' });
            }

            // Build update query
            const updateFields = [];
            const params = [];
            let paramIndex = 1;

            if (status !== undefined) {
                updateFields.push(`status = $${paramIndex}`);
                params.push(status);
                paramIndex++;
            }

            if (workflow_step !== undefined) {
                updateFields.push(`workflow_step = $${paramIndex}`);
                params.push(workflow_step);
                paramIndex++;
            }

            if (assigned_to !== undefined) {
                updateFields.push(`assigned_to = $${paramIndex}`);
                params.push(assigned_to);
                paramIndex++;
            }

            if (actual_value !== undefined) {
                updateFields.push(`actual_value = $${paramIndex}`);
                params.push(actual_value);
                paramIndex++;
            }

            if (priority !== undefined) {
                updateFields.push(`priority = $${paramIndex}`);
                params.push(priority);
                paramIndex++;
            }

            if (ai_insights !== undefined) {
                updateFields.push(`ai_insights = $${paramIndex}`);
                params.push(ai_insights);
                paramIndex++;
            }

            if (status === 'closed') {
                updateFields.push(`closed_at = CURRENT_TIMESTAMP`);
                updateFields.push(`cycle_time_hours = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at))/3600`);
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

            const query = `
                UPDATE claims 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
                RETURNING *
            `;

            params.push(claimId, tenant.id);

            const result = await this.pool.query(query, params);
            const updatedClaim = result.rows[0];

            // Log analytics event
            await this.logAnalyticsEvent(tenant.id, 'claim_updated', {
                claim_id: claimId,
                status: status || currentClaim.rows[0].status,
                workflow_step: workflow_step || currentClaim.rows[0].workflow_step
            }, req.user.id);

            res.json({
                success: true,
                claim: updatedClaim,
                message: 'Claim updated successfully'
            });

        } catch (error) {
            console.error('Update claim error:', error);
            res.status(500).json({
                error: 'Failed to update claim',
                details: error.message
            });
        }
    }

    // Upload documents to claim
    async uploadDocuments(req, res) {
        try {
            const { claimId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Verify claim exists and belongs to tenant
            const claimResult = await this.pool.query(
                'SELECT id FROM claims WHERE id = $1 AND tenant_id = $2',
                [claimId, tenant.id]
            );

            if (claimResult.rows.length === 0) {
                return res.status(404).json({ error: 'Claim not found' });
            }

            // Handle file uploads
            this.upload.array('documents', 10)(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({
                        error: 'File upload error',
                        details: err.message
                    });
                }

                const uploadedFiles = [];
                const files = req.files || [];

                for (const file of files) {
                    const query = `
                        INSERT INTO documents (
                            claim_id, tenant_id, filename, original_filename,
                            file_path, file_size, mime_type, uploaded_by
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        RETURNING *
                    `;

                    const result = await this.pool.query(query, [
                        claimId,
                        tenant.id,
                        file.filename,
                        file.originalname,
                        file.path,
                        file.size,
                        file.mimetype,
                        req.user.id
                    ]);

                    uploadedFiles.push(result.rows[0]);
                }

                // Re-run fraud detection with new documents
                await this.fraudDetection.analyzeClaim(claimId, tenant.id);

                res.json({
                    success: true,
                    documents: uploadedFiles,
                    message: `${uploadedFiles.length} document(s) uploaded successfully`
                });
            });

        } catch (error) {
            console.error('Upload documents error:', error);
            res.status(500).json({
                error: 'Failed to upload documents',
                details: error.message
            });
        }
    }

    // Add comment to claim
    async addComment(req, res) {
        try {
            const { claimId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const { content, comment_type = 'general', is_internal = false } = req.body;

            if (!content) {
                return res.status(400).json({ error: 'Comment content is required' });
            }

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const query = `
                INSERT INTO claim_comments (
                    claim_id, user_id, comment_type, content, is_internal
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const result = await this.pool.query(query, [
                claimId,
                req.user.id,
                comment_type,
                content,
                is_internal
            ]);

            res.status(201).json({
                success: true,
                comment: result.rows[0],
                message: 'Comment added successfully'
            });

        } catch (error) {
            console.error('Add comment error:', error);
            res.status(500).json({
                error: 'Failed to add comment',
                details: error.message
            });
        }
    }

    // Get fraud statistics
    async getFraudStatistics(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const { time_range = '30 days' } = req.query;

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const stats = await this.fraudDetection.getFraudStatistics(tenant.id, time_range);

            res.json({
                success: true,
                statistics: stats,
                time_range
            });

        } catch (error) {
            console.error('Get fraud statistics error:', error);
            res.status(500).json({
                error: 'Failed to retrieve fraud statistics',
                details: error.message
            });
        }
    }

    // Helper methods
    async generateClaimNumber(tenantId) {
        const tenant = await this.getTenant(tenantId);
        const prefix = tenant.slug.toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    }

    async getTenant(tenantSlug) {
        const query = 'SELECT * FROM tenants WHERE slug = $1 AND is_active = true';
        const result = await this.pool.query(query, [tenantSlug]);
        return result.rows[0];
    }

    async logAnalyticsEvent(tenantId, eventType, eventData, userId, claimId = null) {
        const query = `
            INSERT INTO analytics_events (tenant_id, event_type, event_data, user_id, claim_id)
            VALUES ($1, $2, $3, $4, $5)
        `;
        
        await this.pool.query(query, [tenantId, eventType, eventData, userId, claimId]);
    }
}

module.exports = SuperiorClaimsController; 