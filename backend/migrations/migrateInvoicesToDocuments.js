
import pool from '../config/db.js';
(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TABLE IF NOT EXISTS invoices_backup AS TABLE invoices');
    const check = await client.query("SELECT to_regclass('documents') AS exists");
    if (!check.rows[0].exists) {
      await client.query('ALTER TABLE invoices RENAME TO documents');
    }
    await client.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS type TEXT");
    await client.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS title TEXT");
    await client.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS entity TEXT");
    await client.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS fileType TEXT");
    await client.query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS contentHash TEXT");
    await client.query('COMMIT');
    console.log('✅ Migration complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
})();
