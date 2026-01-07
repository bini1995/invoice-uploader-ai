
import pool from '../config/db.js';
async function logAudit(action, invoiceId, userId, username) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (action, invoice_id, user_id, username) VALUES ($1,$2,$3,$4)',
      [action, invoiceId, userId, username]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

export { logAudit };
