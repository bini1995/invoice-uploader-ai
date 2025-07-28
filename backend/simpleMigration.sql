-- Simple usage tracking tables migration
-- Run this directly in the database

-- Create usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  user_id INTEGER,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month VARCHAR(7) NOT NULL
);

-- Create monthly usage summary table
CREATE TABLE IF NOT EXISTS monthly_usage (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL,
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

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_month ON usage_logs(month);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_tenant_month ON monthly_usage(tenant_id, month);

-- Insert sample data for testing
INSERT INTO monthly_usage (tenant_id, month, action, count) VALUES 
  ('default', '2024-01', 'claims_uploads', 25),
  ('default', '2024-01', 'extractions', 50),
  ('default', '2024-01', 'csv_exports', 5)
ON CONFLICT (tenant_id, month, action) DO NOTHING; 