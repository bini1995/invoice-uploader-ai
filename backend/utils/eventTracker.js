const pool = require('../config/db');

async function trackEvent(tenantId, userId, eventName, details = null) {
  try {
    await pool.query(
      'INSERT INTO event_logs (tenant_id, user_id, event_name, details) VALUES ($1,$2,$3,$4)',
      [tenantId, userId, eventName, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Event log error:', err);
  }
}

module.exports = { trackEvent };
