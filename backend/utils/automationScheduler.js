
import cron from 'node-cron';
import pool from '../config/db.js';
import { triggerAutomations } from './automationEngine.js';
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

export { loadSchedules };
