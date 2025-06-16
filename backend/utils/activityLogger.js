const pool = require('../config/db');

async function logActivity(userId, action, invoiceId = null, username = null) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, username, action, invoice_id) VALUES ($1,$2,$3,$4)',
      [userId, username, action, invoiceId]
    );
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

module.exports = { logActivity };
