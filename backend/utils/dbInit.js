const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function initDb() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_number TEXT,
      date DATE,
      amount NUMERIC,
      vendor TEXT,
      party_name TEXT,
      tags JSONB DEFAULT '[]',
      file_name TEXT,
      due_date DATE,
      paid BOOLEAN DEFAULT FALSE,
      archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    const adminHash = bcrypt.hashSync('password123', 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ('admin', $1, 'admin')
       ON CONFLICT (username) DO NOTHING`,
      [adminHash]
    );
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS assignee TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'Pending'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approval_history JSONB DEFAULT '[]'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS priority BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS party_name TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS flag_reason TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS category TEXT");
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
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS encrypted_payload TEXT");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS file_name TEXT");
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

    // Create documents table before referencing it
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
    await pool.query(`CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT,
      file_name TEXT,
      doc_type TEXT,
      path TEXT,
      embedding VECTOR(1536),
      fields JSONB DEFAULT '[]',
      compliance_issues JSONB DEFAULT '[]',
      retention_policy TEXT DEFAULT 'forever',
      delete_at TIMESTAMP,
      expires_at TIMESTAMP,
      archived BOOLEAN DEFAULT FALSE,
      blockchain_tx TEXT,
      document_type TEXT,
      metadata JSONB DEFAULT '{}',
      status TEXT DEFAULT 'new',
      version INTEGER DEFAULT 1,
      expiration TIMESTAMP,
      flag_reason TEXT,
      assignee TEXT,
      assignment_reason TEXT,
      file_type TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS fields JSONB DEFAULT '[]'");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS compliance_issues JSONB DEFAULT '[]'");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS retention_policy TEXT DEFAULT 'forever'");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS delete_at TIMESTAMP");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_type TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new'");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS expiration TIMESTAMP");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS flag_reason TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS blockchain_tx TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS type TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS content_hash TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_title TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS raw_text TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS assignee TEXT");
    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS assignment_reason TEXT");

    await pool.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS searchable tsvector");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_searchable ON documents USING GIN(searchable)");
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops)"
    );
    await pool.query("UPDATE documents SET searchable = to_tsvector('english', coalesce(fields::text,'') || ' ' || coalesce(raw_text,'')) WHERE searchable IS NULL");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_raw_text ON documents USING GIN(to_tsvector('english', raw_text))");

    await pool.query(`CREATE TABLE IF NOT EXISTS document_chunks (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      chunk_index INTEGER,
      content TEXT,
      embedding VECTOR(1536)
    )`);
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops)"
    );

    await pool.query(`CREATE TABLE IF NOT EXISTS document_versions (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      editor_id INTEGER,
      editor_name TEXT,
      diff JSONB,
      snapshot JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      invoice_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS activities_log (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      details JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER,
      action TEXT NOT NULL,
      user_id INTEGER,
      username TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      type TEXT,
      read BOOLEAN DEFAULT FALSE,
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

    await pool.query(`CREATE TABLE IF NOT EXISTS vendor_suggestions (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
      input_vendor TEXT NOT NULL,
      suggested_vendor TEXT NOT NULL,
      confidence NUMERIC,
      accepted BOOLEAN,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS category_feedback (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      suggested_category TEXT NOT NULL,
      confidence NUMERIC,
      accepted BOOLEAN,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS document_workflows (
      id SERIAL PRIMARY KEY,
      department TEXT,
      doc_type TEXT,
      conditions JSONB,
      approval_chain JSONB NOT NULL,
      UNIQUE(department, doc_type)
    )`);
    await pool.query("ALTER TABLE document_workflows ADD COLUMN IF NOT EXISTS doc_type TEXT");
    await pool.query("ALTER TABLE document_workflows ADD COLUMN IF NOT EXISTS conditions JSONB");

    await pool.query(`CREATE TABLE IF NOT EXISTS shared_views (
      token TEXT PRIMARY KEY,
      invoice_ids INTEGER[] NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS shared_dashboards (
      token TEXT PRIMARY KEY,
      filters JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS invites (
      token TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_by INTEGER,
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
      next_send TIMESTAMP NOT NULL,
      user_id INTEGER
    )`);
    // Ensure the new next_send column exists even on older installations
    try {
      await pool.query('ALTER TABLE recurring_templates RENAME COLUMN next_run TO next_send');
    } catch (err) {
      if (err.code !== '42703') throw err; // ignore if column doesn't exist
    }
    await pool.query('ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS next_send TIMESTAMP');
    await pool.query("ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'");
    await pool.query("ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS vat_percent NUMERIC");

    await pool.query(`CREATE TABLE IF NOT EXISTS purchase_orders (
      id SERIAL PRIMARY KEY,
      po_number TEXT UNIQUE,
      vendor TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      matched_invoice_id INTEGER,
      status TEXT DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS feature_requests (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS export_templates (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      tenant_id TEXT,
      name TEXT NOT NULL,
      columns JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // store user corrections from OCR parsing
    await pool.query(`CREATE TABLE IF NOT EXISTS ocr_corrections (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
      field TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      user_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS workflow_rules (
      id SERIAL PRIMARY KEY,
      vendor TEXT,
      amount_greater_than NUMERIC,
      route_to_department TEXT,
      assign_approver TEXT,
      approval_chain JSONB,
      alert_message TEXT,
      alert_email TEXT,
      alert_phone TEXT,
      priority INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query("ALTER TABLE workflow_rules ADD COLUMN IF NOT EXISTS alert_email TEXT");
    await pool.query("ALTER TABLE workflow_rules ADD COLUMN IF NOT EXISTS alert_phone TEXT");

    await pool.query(`CREATE TABLE IF NOT EXISTS workflow_evaluations (
      id SERIAL PRIMARY KEY,
      payload JSONB,
      result JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS automations (
      id SERIAL PRIMARY KEY,
      event TEXT NOT NULL,
      condition TEXT,
      action TEXT NOT NULL,
      config JSONB,
      cron TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS tenant_features (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      feature TEXT NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      UNIQUE(tenant_id, feature)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS tenant_branding (
      tenant_id TEXT PRIMARY KEY,
      accent_color TEXT
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS tenants (
      tenant_id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`);
    await pool.query(
      `INSERT INTO tenants (tenant_id, name) VALUES ('default','Default Account') ON CONFLICT (tenant_id) DO NOTHING`
    );

    await pool.query(`CREATE TABLE IF NOT EXISTS vendor_profiles (
      vendor TEXT PRIMARY KEY,
      country TEXT,
      contact_email TEXT,
      category TEXT,
      contact_name TEXT
    )`);
    await pool.query(`ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS contact_email TEXT`);
    await pool.query(`ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS category TEXT`);
    await pool.query(`ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS contact_name TEXT`);

    await pool.query(`CREATE TABLE IF NOT EXISTS report_schedules (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      vendor TEXT,
      department TEXT,
      start_date DATE,
      end_date DATE,
      cron TEXT NOT NULL DEFAULT '0 8 * * *',
      active BOOLEAN DEFAULT TRUE,
      last_run TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS fraud_training (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
      label BOOLEAN,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS claim_fields (
      id SERIAL PRIMARY KEY,
      document_id INTEGER UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
      fields JSONB,
      version TEXT,
      extracted_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query("ALTER TABLE claim_fields ADD COLUMN IF NOT EXISTS version TEXT");
    await pool.query(
      "ALTER TABLE claim_fields ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP DEFAULT NOW()"
    );

    await pool.query(`CREATE TABLE IF NOT EXISTS extraction_feedback (
      id SERIAL PRIMARY KEY,
      document_id INTEGER UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
      status TEXT,
      reason TEXT,
      note TEXT,
      assigned_to INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query("ALTER TABLE extraction_feedback ADD COLUMN IF NOT EXISTS status TEXT");
    await pool.query("ALTER TABLE extraction_feedback ADD COLUMN IF NOT EXISTS reason TEXT");
    await pool.query("ALTER TABLE extraction_feedback ADD COLUMN IF NOT EXISTS note TEXT");
    await pool.query("ALTER TABLE extraction_feedback ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id)");
    await pool.query(
      "ALTER TABLE extraction_feedback ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()"
    );

    await pool.query(`CREATE TABLE IF NOT EXISTS review_notes (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  } catch (err) {
    console.error('Database init error:', err);
  }
}

module.exports = { initDb };
