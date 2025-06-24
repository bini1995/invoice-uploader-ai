const cron = require('node-cron');
const pool = require('../config/db');
const { triggerAutomations } = require('./automationEngine');

async function loadSchedules() {
  try {
    const { rows } = await pool.query(
      "SELECT id, cron, event FROM automations WHERE active = TRUE AND cron IS NOT NULL"
    );
    for (const row of rows) {
      try {
        cron.schedule(row.cron, () => triggerAutomations(row.event, {}));
      } catch (err) {
        console.error('Automation cron error:', err.message);
      }
    }
  } catch (err) {
    console.error('Load schedules error:', err.message);
  }
}

module.exports = { loadSchedules };
