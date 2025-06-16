const pool = require('../config/db');
const { broadcastActivity } = require('./chatServer');

async function logActivity(userId, action, invoiceId = null, username = null) {
  try {
    const { rows } = await pool.query(
        'INSERT INTO activity_logs (user_id, username, action, invoice_id) VALUES ($1,$2,$3,$4) RETURNING *',
        [userId, username, action, invoiceId]
      );
    broadcastActivity?.(rows[0]);
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

module.exports = { logActivity };
