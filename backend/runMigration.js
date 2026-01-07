
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a direct connection to localhost for migration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'TATA1tata1',
  database: 'invoices_db',
});

async function runMigration() {
  try {
    console.log('🔄 Running usage tracking migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', 'create_usage_tracking_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usage_logs', 'monthly_usage')
    `);
    
    console.log('📋 Created tables:', tables.rows.map(row => row.table_name));
    
    // Check if plan_type column exists in users table
    const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'plan_type'
    `);
    
    if (columns.rows.length > 0) {
      console.log('✅ plan_type column exists in users table');
    } else {
      console.log('⚠️  plan_type column not found in users table');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

runMigration(); 
