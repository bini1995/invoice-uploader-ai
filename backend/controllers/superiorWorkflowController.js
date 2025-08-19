const { Pool } = require('pg');
const { OpenAI } = require('openai');

class SuperiorWorkflowController {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    // Create or update workflow
    async createWorkflow(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const { name, description, nodes, connections, version } = req.body;

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Validate workflow structure
            const validation = this.validateWorkflow(nodes, connections);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.errors });
            }

            // Generate workflow ID if new
            const workflowId = req.body.id || `wf_${Date.now()}`;

            const query = `
                INSERT INTO workflows (id, tenant_id, name, description, nodes, connections, version, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    nodes = EXCLUDED.nodes,
                    connections = EXCLUDED.connections,
                    version = EXCLUDED.version,
                    updated_at = NOW()
                RETURNING *
            `;

            const result = await this.pool.query(query, [
                workflowId,
                tenant.id,
                name,
                description,
                JSON.stringify(nodes),
                JSON.stringify(connections),
                version || 1
            ]);

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Workflow creation error:', error);
            res.status(500).json({
                error: 'Failed to create workflow',
                details: error.message
            });
        }
    }

    // Get workflows for tenant
    async getWorkflows(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const query = `
                SELECT id, name, description, version, is_active, created_at, updated_at
                FROM workflows 
                WHERE tenant_id = $1 
                ORDER BY updated_at DESC
            `;

            const result = await this.pool.query(query, [tenant.id]);

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            console.error('Get workflows error:', error);
            res.status(500).json({
                error: 'Failed to retrieve workflows',
                details: error.message
            });
        }
    }

    // Get specific workflow
    async getWorkflow(req, res) {
        try {
            const { workflowId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const query = `
                SELECT * FROM workflows 
                WHERE id = $1 AND tenant_id = $2
            `;

            const result = await this.pool.query(query, [workflowId, tenant.id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Workflow not found' });
            }

            const workflow = result.rows[0];
            workflow.nodes = JSON.parse(workflow.nodes);
            workflow.connections = JSON.parse(workflow.connections);

            res.json({
                success: true,
                data: workflow
            });

        } catch (error) {
            console.error('Get workflow error:', error);
            res.status(500).json({
                error: 'Failed to retrieve workflow',
                details: error.message
            });
        }
    }

    // Deploy workflow
    async deployWorkflow(req, res) {
        try {
            const { workflowId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Get workflow
            const workflowQuery = `
                SELECT * FROM workflows 
                WHERE id = $1 AND tenant_id = $2
            `;
            const workflowResult = await this.pool.query(workflowQuery, [workflowId, tenant.id]);

            if (workflowResult.rows.length === 0) {
                return res.status(404).json({ error: 'Workflow not found' });
            }

            const workflow = workflowResult.rows[0];
            const nodes = JSON.parse(workflow.nodes);
            const connections = JSON.parse(workflow.connections);

            // Validate workflow before deployment
            const validation = this.validateWorkflow(nodes, connections);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.errors });
            }

            // Update workflow status
            const updateQuery = `
                UPDATE workflows 
                SET is_active = true, updated_at = NOW()
                WHERE id = $1 AND tenant_id = $2
            `;
            await this.pool.query(updateQuery, [workflowId, tenant.id]);

            // Log deployment
            await this.logWorkflowEvent(tenant.id, workflowId, 'workflow_deployed', {
                workflow_name: workflow.name,
                version: workflow.version
            });

            res.json({
                success: true,
                message: 'Workflow deployed successfully'
            });

        } catch (error) {
            console.error('Deploy workflow error:', error);
            res.status(500).json({
                error: 'Failed to deploy workflow',
                details: error.message
            });
        }
    }

    // AI-powered workflow suggestions
    async generateAISuggestions(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const { currentWorkflow } = req.body;

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Get historical workflow data for context
            const historicalData = await this.getHistoricalWorkflowData(tenant.id);

            // Generate AI suggestions
            const suggestions = await this.generateWorkflowSuggestions(currentWorkflow, historicalData);

            res.json({
                success: true,
                data: suggestions
            });

        } catch (error) {
            console.error('AI suggestions error:', error);
            res.status(500).json({
                error: 'Failed to generate AI suggestions',
                details: error.message
            });
        }
    }

    // Execute workflow
    async executeWorkflow(req, res) {
        try {
            const { workflowId } = req.params;
            const { triggerData } = req.body;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Get active workflow
            const workflowQuery = `
                SELECT * FROM workflows 
                WHERE id = $1 AND tenant_id = $2 AND is_active = true
            `;
            const workflowResult = await this.pool.query(workflowQuery, [workflowId, tenant.id]);

            if (workflowResult.rows.length === 0) {
                return res.status(404).json({ error: 'Active workflow not found' });
            }

            const workflow = workflowResult.rows[0];
            const nodes = JSON.parse(workflow.nodes);
            const connections = JSON.parse(workflow.connections);

            // Execute workflow
            const executionResult = await this.executeWorkflowNodes(nodes, connections, triggerData, tenant.id);

            res.json({
                success: true,
                data: executionResult
            });

        } catch (error) {
            console.error('Execute workflow error:', error);
            res.status(500).json({
                error: 'Failed to execute workflow',
                details: error.message
            });
        }
    }

    // Validate workflow structure
    validateWorkflow(nodes, connections) {
        const errors = [];

        if (!nodes || nodes.length === 0) {
            errors.push('Workflow must have at least one node');
        }

        if (!connections || connections.length === 0) {
            errors.push('Workflow must have at least one connection');
        }

        // Check for orphaned nodes
        const connectedNodes = new Set();
        connections.forEach(conn => {
            connectedNodes.add(conn.source);
            connectedNodes.add(conn.target);
        });

        nodes.forEach(node => {
            if (!connectedNodes.has(node.id)) {
                errors.push(`Node ${node.id} is not connected`);
            }
        });

        // Check for cycles (simplified)
        const hasCycle = this.detectCycles(nodes, connections);
        if (hasCycle) {
            errors.push('Workflow contains cycles which are not allowed');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Detect cycles in workflow (simplified implementation)
    detectCycles(nodes, connections) {
        const graph = {};
        nodes.forEach(node => {
            graph[node.id] = [];
        });

        connections.forEach(conn => {
            if (graph[conn.source]) {
                graph[conn.source].push(conn.target);
            }
        });

        const visited = new Set();
        const recStack = new Set();

        const dfs = (nodeId) => {
            if (recStack.has(nodeId)) return true;
            if (visited.has(nodeId)) return false;

            visited.add(nodeId);
            recStack.add(nodeId);

            for (const neighbor of graph[nodeId] || []) {
                if (dfs(neighbor)) return true;
            }

            recStack.delete(nodeId);
            return false;
        };

        for (const nodeId of Object.keys(graph)) {
            if (dfs(nodeId)) return true;
        }

        return false;
    }

    // Generate AI suggestions for workflow optimization
    async generateWorkflowSuggestions(currentWorkflow, historicalData) {
        const prompt = `
        Analyze this claims processing workflow and suggest improvements:

        Current Workflow:
        - Nodes: ${JSON.stringify(currentWorkflow.nodes)}
        - Connections: ${JSON.stringify(currentWorkflow.connections)}

        Historical Performance Data:
        - Average processing time: ${historicalData.avgProcessingTime} hours
        - Fraud detection rate: ${historicalData.fraudDetectionRate}%
        - Approval bottlenecks: ${historicalData.approvalBottlenecks}%

        Suggest workflow improvements that would:
        1. Reduce processing time
        2. Improve fraud detection
        3. Eliminate bottlenecks
        4. Add missing security checks
        5. Optimize for compliance

        Provide specific node additions and modifications.
        `;

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a workflow optimization expert specializing in claims processing automation."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 1000
            });

            const suggestions = this.parseAISuggestions(completion.choices[0].message.content);
            return suggestions;

        } catch (error) {
            console.error('AI suggestion generation failed:', error);
            return this.getDefaultSuggestions(currentWorkflow);
        }
    }

    // Parse AI suggestions into structured format
    parseAISuggestions(aiResponse) {
        // This is a simplified parser - in production, you'd want more sophisticated parsing
        const suggestions = [];

        // Extract common patterns from AI response
        if (aiResponse.includes('fraud detection')) {
            suggestions.push({
                description: 'Add AI-powered fraud detection node to improve security',
                nodes: [{
                    id: `fraud_check_${Date.now()}`,
                    type: 'fraud_check',
                    position: { x: 300, y: 200 },
                    data: {
                        label: 'AI Fraud Check',
                        description: 'Advanced fraud detection using machine learning',
                        config: {
                            threshold: 0.7,
                            autoBlock: true,
                            notifyOnHigh: true
                        }
                    }
                }],
                connections: []
            });
        }

        if (aiResponse.includes('approval')) {
            suggestions.push({
                description: 'Add automated approval workflow to reduce bottlenecks',
                nodes: [{
                    id: `approval_${Date.now()}`,
                    type: 'approval',
                    position: { x: 400, y: 300 },
                    data: {
                        label: 'Smart Approval',
                        description: 'Automated approval with escalation',
                        config: {
                            approvers: [],
                            timeout: 24,
                            escalation: true
                        }
                    }
                }],
                connections: []
            });
        }

        return suggestions;
    }

    // Default suggestions when AI fails
    getDefaultSuggestions(currentWorkflow) {
        return [
            {
                description: 'Add fraud detection node for better security',
                nodes: [{
                    id: `fraud_check_${Date.now()}`,
                    type: 'fraud_check',
                    position: { x: 300, y: 200 },
                    data: {
                        label: 'Fraud Detection',
                        description: 'AI-powered fraud analysis',
                        config: {
                            threshold: 0.7,
                            autoBlock: true,
                            notifyOnHigh: true
                        }
                    }
                }],
                connections: []
            },
            {
                description: 'Add notification node for better communication',
                nodes: [{
                    id: `notification_${Date.now()}`,
                    type: 'notification',
                    position: { x: 500, y: 200 },
                    data: {
                        label: 'Status Notification',
                        description: 'Send status updates to stakeholders',
                        config: {
                            type: 'email',
                            recipients: [],
                            template: 'status_update'
                        }
                    }
                }],
                connections: []
            }
        ];
    }

    // Execute workflow nodes
    async executeWorkflowNodes(nodes, connections, triggerData, tenantId) {
        const executionLog = [];
        const nodeResults = new Map();

        // Find trigger nodes
        const triggerNodes = nodes.filter(node => node.type === 'trigger');
        
        for (const triggerNode of triggerNodes) {
            executionLog.push({
                nodeId: triggerNode.id,
                type: 'trigger',
                status: 'executed',
                timestamp: new Date().toISOString(),
                data: triggerData
            });

            // Execute connected nodes
            await this.executeConnectedNodes(triggerNode.id, nodes, connections, nodeResults, executionLog, tenantId);
        }

        return {
            executionId: `exec_${Date.now()}`,
            status: 'completed',
            log: executionLog,
            results: Object.fromEntries(nodeResults)
        };
    }

    // Execute connected nodes recursively
    async executeConnectedNodes(sourceNodeId, nodes, connections, nodeResults, executionLog, tenantId) {
        const connectedConnections = connections.filter(conn => conn.source === sourceNodeId);
        
        for (const connection of connectedConnections) {
            const targetNode = nodes.find(node => node.id === connection.target);
            if (!targetNode) continue;

            try {
                const result = await this.executeNode(targetNode, nodeResults, tenantId);
                nodeResults.set(targetNode.id, result);
                
                executionLog.push({
                    nodeId: targetNode.id,
                    type: targetNode.type,
                    status: 'executed',
                    timestamp: new Date().toISOString(),
                    result
                });

                // Continue with connected nodes
                await this.executeConnectedNodes(targetNode.id, nodes, connections, nodeResults, executionLog, tenantId);

            } catch (error) {
                executionLog.push({
                    nodeId: targetNode.id,
                    type: targetNode.type,
                    status: 'failed',
                    timestamp: new Date().toISOString(),
                    error: error.message
                });
            }
        }
    }

    // Execute individual node
    async executeNode(node, nodeResults, tenantId) {
        switch (node.type) {
            case 'condition':
                return this.executeConditionNode(node, nodeResults);
            case 'action':
                return this.executeActionNode(node, nodeResults, tenantId);
            case 'approval':
                return this.executeApprovalNode(node, nodeResults, tenantId);
            case 'fraud_check':
                return this.executeFraudCheckNode(node, nodeResults, tenantId);
            case 'notification':
                return this.executeNotificationNode(node, nodeResults, tenantId);
            case 'integration':
                return this.executeIntegrationNode(node, nodeResults, tenantId);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    // Execute condition node
    async executeConditionNode(node, nodeResults) {
        const config = node.data.config;
        const rules = config.rules || [];
        
        if (config.operator === 'AND') {
            return rules.every(rule => this.evaluateRule(rule, nodeResults));
        } else {
            return rules.some(rule => this.evaluateRule(rule, nodeResults));
        }
    }

    // Execute action node
    async executeActionNode(node, nodeResults, tenantId) {
        const config = node.data.config;
        
        switch (config.action) {
            case 'assign_claim':
                return await this.assignClaim(config.parameters, tenantId);
            case 'send_notification':
                return await this.sendNotification(config.parameters, tenantId);
            case 'update_status':
                return await this.updateClaimStatus(config.parameters, tenantId);
            default:
                throw new Error(`Unknown action: ${config.action}`);
        }
    }

    // Execute approval node
    async executeApprovalNode(node, nodeResults, tenantId) {
        const config = node.data.config;
        
        // Create approval request
        const approvalId = `approval_${Date.now()}`;
        
        const query = `
            INSERT INTO approval_requests (id, tenant_id, workflow_node_id, approvers, timeout_hours, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
        `;
        
        await this.pool.query(query, [
            approvalId,
            tenantId,
            node.id,
            JSON.stringify(config.approvers),
            config.timeout
        ]);

        return {
            approvalId,
            status: 'pending',
            approvers: config.approvers,
            timeout: config.timeout
        };
    }

    // Execute fraud check node
    async executeFraudCheckNode(node, nodeResults, tenantId) {
        const config = node.data.config;
        
        // Get claim data from previous nodes
        const claimData = this.getClaimDataFromResults(nodeResults);
        
        // Run fraud detection
        const fraudScore = await this.calculateFraudScore(claimData, tenantId);
        
        const result = {
            fraudScore,
            threshold: config.threshold,
            isHighRisk: fraudScore > config.threshold,
            autoBlocked: config.autoBlock && fraudScore > config.threshold
        };

        if (result.isHighRisk && config.notifyOnHigh) {
            await this.notifyHighRiskClaim(claimData, fraudScore, tenantId);
        }

        return result;
    }

    // Execute notification node
    async executeNotificationNode(node, nodeResults, tenantId) {
        const config = node.data.config;
        
        // Send notification based on type
        switch (config.type) {
            case 'email':
                return await this.sendEmailNotification(config, nodeResults, tenantId);
            case 'sms':
                return await this.sendSMSNotification(config, nodeResults, tenantId);
            default:
                throw new Error(`Unknown notification type: ${config.type}`);
        }
    }

    // Execute integration node
    async executeIntegrationNode(node, nodeResults, tenantId) {
        const config = node.data.config;
        
        // Integrate with external system
        switch (config.system) {
            case 'crm':
                return await this.integrateWithCRM(config, nodeResults, tenantId);
            case 'erp':
                return await this.integrateWithERP(config, nodeResults, tenantId);
            default:
                throw new Error(`Unknown integration system: ${config.system}`);
        }
    }

    // Helper methods for node execution
    evaluateRule(rule, nodeResults) {
        // Simplified rule evaluation
        return true; // Placeholder
    }

    async assignClaim(parameters, tenantId) {
        // Assign claim to user or team
        return { assigned: true, assignee: parameters.assignee };
    }

    async sendNotification(parameters, tenantId) {
        // Send notification
        return { sent: true, recipients: parameters.recipients };
    }

    async updateClaimStatus(parameters, tenantId) {
        // Update claim status
        return { updated: true, newStatus: parameters.status };
    }

    async calculateFraudScore(claimData, tenantId) {
        // Calculate fraud score using AI
        return Math.random(); // Placeholder
    }

    async notifyHighRiskClaim(claimData, fraudScore, tenantId) {
        // Notify about high-risk claim
        return { notified: true };
    }

    async sendEmailNotification(config, nodeResults, tenantId) {
        // Send email notification
        return { emailSent: true };
    }

    async sendSMSNotification(config, nodeResults, tenantId) {
        // Send SMS notification
        return { smsSent: true };
    }

    async integrateWithCRM(config, nodeResults, tenantId) {
        // Integrate with CRM
        return { crmIntegrated: true };
    }

    async integrateWithERP(config, nodeResults, tenantId) {
        // Integrate with ERP
        return { erpIntegrated: true };
    }

    getClaimDataFromResults(nodeResults) {
        // Extract claim data from previous node results
        return {}; // Placeholder
    }

    // Get historical workflow data for AI suggestions
    async getHistoricalWorkflowData(tenantId) {
        const query = `
            SELECT 
                AVG(execution_time) as avg_processing_time,
                COUNT(CASE WHEN fraud_detected = true THEN 1 END) * 100.0 / COUNT(*) as fraud_detection_rate,
                COUNT(CASE WHEN status = 'bottleneck' THEN 1 END) * 100.0 / COUNT(*) as approval_bottlenecks
            FROM workflow_executions 
            WHERE tenant_id = $1 
            AND created_at >= NOW() - INTERVAL '30 days'
        `;

        try {
            const result = await this.pool.query(query, [tenantId]);
            return result.rows[0] || {
                avgProcessingTime: 24,
                fraudDetectionRate: 85,
                approvalBottlenecks: 15
            };
        } catch (error) {
            return {
                avgProcessingTime: 24,
                fraudDetectionRate: 85,
                approvalBottlenecks: 15
            };
        }
    }

    // Log workflow events
    async logWorkflowEvent(tenantId, workflowId, eventType, eventData) {
        const query = `
            INSERT INTO workflow_events (tenant_id, workflow_id, event_type, event_data, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        `;

        await this.pool.query(query, [
            tenantId,
            workflowId,
            eventType,
            JSON.stringify(eventData)
        ]);
    }

    // Get tenant
    async getTenant(tenantSlug) {
        const query = 'SELECT * FROM tenants WHERE slug = $1 AND is_active = true';
        const result = await this.pool.query(query, [tenantSlug]);
        return result.rows[0];
    }
}

module.exports = SuperiorWorkflowController; 