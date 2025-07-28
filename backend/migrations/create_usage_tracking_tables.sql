-- Create usage tracking tables
-- Run this migration to set up usage tracking functionality

-- Usage logs table for detailed tracking
CREATE TABLE IF NOT EXISTS usage_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month VARCHAR(7) NOT NULL -- YYYY-MM format for efficient querying
);

-- Monthly usage summary table for fast aggregations
CREATE TABLE IF NOT EXISTS monthly_usage (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  action VARCHAR(100) NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, month, action)
);

-- Add plan_type column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'plan_type') THEN
    ALTER TABLE users ADD COLUMN plan_type VARCHAR(50) DEFAULT 'free';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_month ON usage_logs(month);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_month ON usage_logs(tenant_id, month);

CREATE INDEX IF NOT EXISTS idx_monthly_usage_tenant_id ON monthly_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_month ON monthly_usage(month);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_action ON monthly_usage(action);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_tenant_month ON monthly_usage(tenant_id, month);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_monthly_usage_updated_at 
    BEFORE UPDATE ON monthly_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO monthly_usage (tenant_id, month, action, count) VALUES 
--   ('default', '2024-01', 'claims_uploads', 25),
--   ('default', '2024-01', 'extractions', 50),
--   ('default', '2024-01', 'csv_exports', 5);

-- Create a view for easy usage statistics
CREATE OR REPLACE VIEW usage_stats_view AS
SELECT 
  mu.tenant_id,
  mu.month,
  mu.action,
  mu.count as current_month_count,
  COALESCE(SUM(mu2.count), 0) as total_count
FROM monthly_usage mu
LEFT JOIN monthly_usage mu2 ON mu.tenant_id = mu2.tenant_id 
  AND mu.action = mu2.action 
  AND mu2.month <= mu.month
GROUP BY mu.tenant_id, mu.month, mu.action, mu.count;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON usage_logs TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON monthly_usage TO your_app_user;
-- GRANT SELECT ON usage_stats_view TO your_app_user; 