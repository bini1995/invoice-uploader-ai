const pool = require('../config/db');

async function logActivity(userId, action, invoiceId = null) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, invoice_id) VALUES ($1,$2,$3)',
      [userId, action, invoiceId]
    );
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

module.exports = { logActivity };
