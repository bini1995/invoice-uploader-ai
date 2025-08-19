-- Superior Claims Platform Database Schema
-- Designed to outperform ClaimSorted with advanced features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table for multi-tenant architecture
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    custom_branding JSONB DEFAULT '{}',
    workflow_config JSONB DEFAULT '{}',
    security_settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    api_rate_limit INTEGER DEFAULT 1000,
    max_users INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Users table with enhanced roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims table with advanced features
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    policy_number VARCHAR(100),
    policyholder_name VARCHAR(255),
    claim_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    priority INTEGER DEFAULT 3,
    estimated_value DECIMAL(15,2),
    actual_value DECIMAL(15,2),
    fraud_score DECIMAL(5,2) DEFAULT 0.0,
    risk_level VARCHAR(20) DEFAULT 'low',
    ai_insights JSONB DEFAULT '{}',
    workflow_step VARCHAR(100) DEFAULT 'initial_review',
    assigned_to UUID REFERENCES users(id),
    submitted_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    cycle_time_hours INTEGER DEFAULT 0
);

-- Documents table for claim attachments
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    document_type VARCHAR(50),
    ocr_text TEXT,
    ai_analysis JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fraud detection events
CREATE TABLE fraud_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    ai_confidence DECIMAL(5,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow steps for claims processing
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    required_roles JSONB DEFAULT '[]',
    auto_approve BOOLEAN DEFAULT false,
    ai_assisted BOOLEAN DEFAULT true,
    time_limit_hours INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments and communications
CREATE TABLE claim_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment_type VARCHAR(50) DEFAULT 'general',
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics and reporting data
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id),
    claim_id UUID REFERENCES claims(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys for external integrations
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflows table for advanced workflow engine
CREATE TABLE workflows (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    nodes JSONB NOT NULL DEFAULT '[]',
    connections JSONB NOT NULL DEFAULT '[]',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions for tracking
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    workflow_id VARCHAR(100) REFERENCES workflows(id) ON DELETE CASCADE,
    execution_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'running',
    execution_log JSONB DEFAULT '[]',
    execution_time INTEGER DEFAULT 0,
    fraud_detected BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Workflow events for audit trail
CREATE TABLE workflow_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    workflow_id VARCHAR(100) REFERENCES workflows(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approval requests for workflow approvals
CREATE TABLE approval_requests (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    workflow_node_id VARCHAR(100) NOT NULL,
    approvers JSONB DEFAULT '[]',
    timeout_hours INTEGER DEFAULT 24,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integrations table for third-party connections
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    api_key TEXT,
    api_secret TEXT,
    webhook_url VARCHAR(500),
    environment VARCHAR(50) DEFAULT 'production',
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT false,
    last_sync TIMESTAMP,
    data_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration logs for audit trail
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    activity VARCHAR(100) NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_claims_tenant_id ON claims(tenant_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_fraud_score ON claims(fraud_score);
CREATE INDEX idx_claims_created_at ON claims(created_at);
CREATE INDEX idx_documents_claim_id ON documents(claim_id);
CREATE INDEX idx_fraud_events_claim_id ON fraud_events(claim_id);
CREATE INDEX idx_analytics_events_tenant_id ON analytics_events(tenant_id);
CREATE INDEX idx_performance_metrics_tenant_date ON performance_metrics(tenant_id, metric_date);
CREATE INDEX idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX idx_workflows_active ON workflows(is_active);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_events_workflow_id ON workflow_events(workflow_id);
CREATE INDEX idx_approval_requests_tenant_id ON approval_requests(tenant_id);
CREATE INDEX idx_integrations_tenant_id ON integrations(tenant_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_active ON integrations(is_active);
CREATE INDEX idx_integration_logs_integration_id ON integration_logs(integration_id);

-- Insert default tenant
INSERT INTO tenants (name, slug, subscription_tier) VALUES 
('Default Tenant', 'default', 'enterprise');

-- Insert default admin user
INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, role) VALUES 
((SELECT id FROM tenants WHERE slug = 'default'), 'admin@clarifyops.com', '$2b$10$default_hash_here', 'Admin', 'User', 'admin');

-- Insert default workflow steps
INSERT INTO workflow_steps (tenant_id, step_name, step_order, required_roles, ai_assisted) VALUES 
((SELECT id FROM tenants WHERE slug = 'default'), 'Initial Review', 1, '["reviewer", "admin"]', true),
((SELECT id FROM tenants WHERE slug = 'default'), 'Fraud Check', 2, '["fraud_analyst", "admin"]', true),
((SELECT id FROM tenants WHERE slug = 'default'), 'Approval', 3, '["approver", "admin"]', false),
((SELECT id FROM tenants WHERE slug = 'default'), 'Payment Processing', 4, '["processor", "admin"]', true); 