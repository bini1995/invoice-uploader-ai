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
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS integrity_hash TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS retention_policy TEXT DEFAULT 'forever'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS delete_at TIMESTAMP");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'default'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS department TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS review_flag BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS review_notes TEXT");

    await pool.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      action TEXT NOT NULL,
      invoice_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

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
  } catch (err) {
    console.error('Database init error:', err);
  }
}

module.exports = { initDb };
