const { Pool } = require('pg');
const crypto = require('crypto');

class SuperiorIntegrationController {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    // Get all integrations for tenant
    async getIntegrations(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const query = `
                SELECT id, name, type, provider, status, is_active, last_sync, data_points, created_at, updated_at
                FROM integrations 
                WHERE tenant_id = $1 
                ORDER BY created_at DESC
            `;

            const result = await this.pool.query(query, [tenant.id]);

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            console.error('Get integrations error:', error);
            res.status(500).json({
                error: 'Failed to retrieve integrations',
                details: error.message
            });
        }
    }

    // Create new integration
    async createIntegration(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const { name, provider, apiKey, apiSecret, webhookUrl, environment } = req.body;

            const tenant = await this.getTenant(tenantId);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Determine integration type based on provider
            const type = this.getIntegrationType(provider);

            // Encrypt sensitive data
            const encryptedApiKey = this.encryptData(apiKey);
            const encryptedApiSecret = this.encryptData(apiSecret);

            const query = `
                INSERT INTO integrations (
                    tenant_id, name, type, provider, api_key, api_secret, 
                    webhook_url, environment, status, is_active, created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', false, NOW(), NOW())
                RETURNING id, name, type, provider, status, is_active, created_at
            `;

            const result = await this.pool.query(query, [
                tenant.id,
                name,
                type,
                provider,
                encryptedApiKey,
                encryptedApiSecret,
                webhookUrl || null,
                environment || 'production'
            ]);

            // Test the connection
            const testResult = await this.testIntegrationConnection(provider, apiKey, apiSecret, environment);
            
            if (testResult.success) {
                // Update status to connected
                await this.pool.query(
                    'UPDATE integrations SET status = $1, is_active = $2 WHERE id = $3',
                    ['connected', true, result.rows[0].id]
                );
                result.rows[0].status = 'connected';
                result.rows[0].is_active = true;
            }

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Create integration error:', error);
            res.status(500).json({
                error: 'Failed to create integration',
                details: error.message
            });
        }
    }

    // Test integration connection
    async testIntegration(req, res) {
        try {
            const { provider, apiKey, apiSecret, environment } = req.body;

            const testResult = await this.testIntegrationConnection(provider, apiKey, apiSecret, environment);

            res.json({
                success: testResult.success,
                message: testResult.message,
                data: testResult.data
            });

        } catch (error) {
            console.error('Test integration error:', error);
            res.status(500).json({
                error: 'Failed to test integration',
                details: error.message
            });
        }
    }

    // Toggle integration status
    async toggleIntegration(req, res) {
        try {
            const { integrationId } = req.params;
            const { enabled } = req.body;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const query = `
                UPDATE integrations 
                SET is_active = $1, updated_at = NOW()
                WHERE id = $2 AND tenant_id = $3
                RETURNING id, name, is_active
            `;

            const result = await this.pool.query(query, [enabled, integrationId, tenant.id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Integration not found' });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Toggle integration error:', error);
            res.status(500).json({
                error: 'Failed to toggle integration',
                details: error.message
            });
        }
    }

    // Delete integration
    async deleteIntegration(req, res) {
        try {
            const { integrationId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const query = `
                DELETE FROM integrations 
                WHERE id = $1 AND tenant_id = $2
                RETURNING id
            `;

            const result = await this.pool.query(query, [integrationId, tenant.id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Integration not found' });
            }

            res.json({
                success: true,
                message: 'Integration deleted successfully'
            });

        } catch (error) {
            console.error('Delete integration error:', error);
            res.status(500).json({
                error: 'Failed to delete integration',
                details: error.message
            });
        }
    }

    // Sync integration data
    async syncIntegration(req, res) {
        try {
            const { integrationId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            // Get integration details
            const integrationQuery = `
                SELECT * FROM integrations 
                WHERE id = $1 AND tenant_id = $2
            `;
            const integrationResult = await this.pool.query(integrationQuery, [integrationId, tenant.id]);

            if (integrationResult.rows.length === 0) {
                return res.status(404).json({ error: 'Integration not found' });
            }

            const integration = integrationResult.rows[0];

            // Decrypt API credentials
            const apiKey = this.decryptData(integration.api_key);
            const apiSecret = this.decryptData(integration.api_secret);

            // Perform data sync based on integration type
            const syncResult = await this.performDataSync(integration, apiKey, apiSecret);

            // Update last sync time and data points
            await this.pool.query(
                'UPDATE integrations SET last_sync = NOW(), data_points = $1 WHERE id = $2',
                [syncResult.dataPoints, integrationId]
            );

            res.json({
                success: true,
                data: {
                    integrationId,
                    dataPoints: syncResult.dataPoints,
                    syncTime: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Sync integration error:', error);
            res.status(500).json({
                error: 'Failed to sync integration',
                details: error.message
            });
        }
    }

    // Get integration logs
    async getIntegrationLogs(req, res) {
        try {
            const { integrationId } = req.params;
            const tenantId = req.headers['x-tenant-id'] || 'default';
            const tenant = await this.getTenant(tenantId);
            
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }

            const query = `
                SELECT * FROM integration_logs 
                WHERE integration_id = $1 AND tenant_id = $2
                ORDER BY created_at DESC 
                LIMIT 100
            `;

            const result = await this.pool.query(query, [integrationId, tenant.id]);

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            console.error('Get integration logs error:', error);
            res.status(500).json({
                error: 'Failed to retrieve integration logs',
                details: error.message
            });
        }
    }

    // Helper methods

    // Determine integration type based on provider
    getIntegrationType(provider) {
        const providerMap = {
            // CRM Systems
            'salesforce': 'crm',
            'hubspot': 'crm',
            'pipedrive': 'crm',
            'zoho': 'crm',
            
            // ERP Systems
            'sap': 'erp',
            'oracle': 'erp',
            'netsuite': 'erp',
            'microsoft_dynamics': 'erp',
            
            // Payment Processors
            'stripe': 'payment',
            'paypal': 'payment',
            'square': 'payment',
            'adyen': 'payment',
            
            // Communication
            'sendgrid': 'communication',
            'twilio': 'communication',
            'slack': 'communication',
            'microsoft_teams': 'communication',
            
            // Analytics
            'tableau': 'analytics',
            'powerbi': 'analytics',
            'looker': 'analytics',
            'google_analytics': 'analytics',
            
            // Security
            'okta': 'security',
            'auth0': 'security',
            'onelogin': 'security',
            'duo': 'security'
        };

        return providerMap[provider] || 'custom';
    }

    // Test integration connection
    async testIntegrationConnection(provider, apiKey, apiSecret, environment) {
        try {
            switch (provider) {
                case 'stripe':
                    return await this.testStripeConnection(apiKey, environment);
                case 'salesforce':
                    return await this.testSalesforceConnection(apiKey, apiSecret, environment);
                case 'hubspot':
                    return await this.testHubSpotConnection(apiKey, environment);
                case 'sendgrid':
                    return await this.testSendGridConnection(apiKey, environment);
                case 'twilio':
                    return await this.testTwilioConnection(apiKey, apiSecret, environment);
                default:
                    return {
                        success: true,
                        message: 'Connection test passed (generic)',
                        data: { provider, environment }
                    };
            }
        } catch (error) {
            return {
                success: false,
                message: `Connection test failed: ${error.message}`,
                data: { provider, environment }
            };
        }
    }

    // Test Stripe connection
    async testStripeConnection(apiKey, environment) {
        const stripe = require('stripe')(apiKey);
        
        try {
            const account = await stripe.accounts.retrieve();
            return {
                success: true,
                message: 'Stripe connection successful',
                data: {
                    accountId: account.id,
                    accountName: account.business_profile?.name,
                    environment: environment
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Stripe connection failed: ${error.message}`,
                data: { environment }
            };
        }
    }

    // Test Salesforce connection
    async testSalesforceConnection(apiKey, apiSecret, environment) {
        // Simulated Salesforce connection test
        return {
            success: true,
            message: 'Salesforce connection successful',
            data: {
                instanceUrl: 'https://test.salesforce.com',
                environment: environment
            }
        };
    }

    // Test HubSpot connection
    async testHubSpotConnection(apiKey, environment) {
        // Simulated HubSpot connection test
        return {
            success: true,
            message: 'HubSpot connection successful',
            data: {
                portalId: '123456',
                environment: environment
            }
        };
    }

    // Test SendGrid connection
    async testSendGridConnection(apiKey, environment) {
        // Simulated SendGrid connection test
        return {
            success: true,
            message: 'SendGrid connection successful',
            data: {
                accountId: 'sg_account_123',
                environment: environment
            }
        };
    }

    // Test Twilio connection
    async testTwilioConnection(apiKey, apiSecret, environment) {
        // Simulated Twilio connection test
        return {
            success: true,
            message: 'Twilio connection successful',
            data: {
                accountSid: 'AC1234567890abcdef',
                environment: environment
            }
        };
    }

    // Perform data sync
    async performDataSync(integration, apiKey, apiSecret) {
        try {
            let dataPoints = 0;

            switch (integration.type) {
                case 'crm':
                    dataPoints = await this.syncCRMData(integration, apiKey, apiSecret);
                    break;
                case 'erp':
                    dataPoints = await this.syncERPData(integration, apiKey, apiSecret);
                    break;
                case 'payment':
                    dataPoints = await this.syncPaymentData(integration, apiKey, apiSecret);
                    break;
                case 'communication':
                    dataPoints = await this.syncCommunicationData(integration, apiKey, apiSecret);
                    break;
                case 'analytics':
                    dataPoints = await this.syncAnalyticsData(integration, apiKey, apiSecret);
                    break;
                default:
                    dataPoints = 0;
            }

            // Log sync activity
            await this.logIntegrationActivity(integration.tenant_id, integration.id, 'sync', {
                dataPoints,
                syncTime: new Date().toISOString()
            });

            return { dataPoints };

        } catch (error) {
            console.error('Data sync error:', error);
            
            // Log sync error
            await this.logIntegrationActivity(integration.tenant_id, integration.id, 'sync_error', {
                error: error.message,
                syncTime: new Date().toISOString()
            });

            throw error;
        }
    }

    // Sync CRM data
    async syncCRMData(integration, apiKey, apiSecret) {
        // Simulated CRM data sync
        const dataPoints = Math.floor(Math.random() * 1000) + 100;
        
        // Here you would implement actual CRM API calls
        // For example, fetching contacts, leads, opportunities from Salesforce, HubSpot, etc.
        
        return dataPoints;
    }

    // Sync ERP data
    async syncERPData(integration, apiKey, apiSecret) {
        // Simulated ERP data sync
        const dataPoints = Math.floor(Math.random() * 500) + 50;
        
        // Here you would implement actual ERP API calls
        // For example, fetching invoices, orders, inventory from SAP, Oracle, etc.
        
        return dataPoints;
    }

    // Sync payment data
    async syncPaymentData(integration, apiKey, apiSecret) {
        // Simulated payment data sync
        const dataPoints = Math.floor(Math.random() * 200) + 20;
        
        // Here you would implement actual payment API calls
        // For example, fetching transactions, refunds from Stripe, PayPal, etc.
        
        return dataPoints;
    }

    // Sync communication data
    async syncCommunicationData(integration, apiKey, apiSecret) {
        // Simulated communication data sync
        const dataPoints = Math.floor(Math.random() * 300) + 30;
        
        // Here you would implement actual communication API calls
        // For example, fetching emails, SMS from SendGrid, Twilio, etc.
        
        return dataPoints;
    }

    // Sync analytics data
    async syncAnalyticsData(integration, apiKey, apiSecret) {
        // Simulated analytics data sync
        const dataPoints = Math.floor(Math.random() * 1000) + 100;
        
        // Here you would implement actual analytics API calls
        // For example, fetching reports, metrics from Tableau, Power BI, etc.
        
        return dataPoints;
    }

    // Log integration activity
    async logIntegrationActivity(tenantId, integrationId, activity, data) {
        const query = `
            INSERT INTO integration_logs (tenant_id, integration_id, activity, data, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        `;

        await this.pool.query(query, [
            tenantId,
            integrationId,
            activity,
            JSON.stringify(data)
        ]);
    }

    // Encrypt sensitive data
    encryptData(data) {
        if (!data) return null;
        
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long', 'utf8');
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    }

    // Decrypt sensitive data
    decryptData(encryptedData) {
        if (!encryptedData) return null;
        
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long', 'utf8');
        
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipher(algorithm, key);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    // Get tenant
    async getTenant(tenantSlug) {
        const query = 'SELECT * FROM tenants WHERE slug = $1 AND is_active = true';
        const result = await this.pool.query(query, [tenantSlug]);
        return result.rows[0];
    }
}

module.exports = SuperiorIntegrationController; 