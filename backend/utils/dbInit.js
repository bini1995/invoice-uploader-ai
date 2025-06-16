const pool = require('../config/db');

async function initDb() {
  try {
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS assignee TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'Pending'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approval_history JSONB DEFAULT '[]'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS priority BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS flag_reason TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approval_chain JSONB DEFAULT '[\"Manager\",\"Finance\",\"CFO\"]'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS private_notes TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date DATE");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS po_id INTEGER");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS integrity_hash TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS content_hash TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS blockchain_tx TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS retention_policy TEXT DEFAULT 'forever'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS delete_at TIMESTAMP");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'default'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS department TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS expired BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS review_flag BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS review_notes TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link TEXT");

    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS next_retry TIMESTAMP");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS late_fee NUMERIC DEFAULT 0");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS original_amount NUMERIC");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vat_percent NUMERIC");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vat_amount NUMERIC");

    await pool.query(`CREATE TABLE IF NOT EXISTS invoice_versions (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
      editor_id INTEGER,
      editor_name TEXT,
      diff JSONB,
      snapshot JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query("ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'");
    await pool.query("ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS vat_percent NUMERIC");

    await pool.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      invoice_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(
      "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS username TEXT"
    );

    await pool.query(`CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      vendor TEXT,
      tag TEXT,
      period TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      UNIQUE(vendor, tag, period)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      endpoint TEXT,
      rating INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS vendor_notes (
      vendor TEXT PRIMARY KEY,
      notes TEXT
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS workflows (
      department TEXT PRIMARY KEY,
      approval_chain JSONB NOT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS shared_views (
      token TEXT PRIMARY KEY,
      invoice_ids INTEGER[] NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS recurring_templates (
      id SERIAL PRIMARY KEY,
      vendor TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      currency TEXT DEFAULT 'USD',
      vat_percent NUMERIC,
      description TEXT,
      interval_days INTEGER NOT NULL,
      next_run TIMESTAMP NOT NULL,
      user_id INTEGER
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS purchase_orders (
      id SERIAL PRIMARY KEY,
      po_number TEXT UNIQUE,
      vendor TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      matched_invoice_id INTEGER,
      status TEXT DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  } catch (err) {
    console.error('Database init error:', err);
  }
}

module.exports = { initDb };
