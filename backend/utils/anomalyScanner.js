
import cron from 'node-cron';
import pool from '../config/db.js';
import { sendSlackNotification } from './notify.js';
import { broadcastNotification } from './chatServer.js';
import { loadAnomalyModel } from './anomalyTrainer.js';
async function scanAnomalies(months = 3) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months, 1);
  const model = loadAnomalyModel();
  const baseThreshold = model?.baseThreshold || 2;
  try {
    const { rows } = await pool.query(
      `SELECT vendor, DATE_TRUNC('month', date) AS m, SUM(amount) AS total
       FROM invoices
       WHERE date >= $1
       GROUP BY vendor, m
       ORDER BY vendor, m`,
      [start]
    );
    const data = {};
    rows.forEach((r) => {
      if (!data[r.vendor]) data[r.vendor] = [];
      data[r.vendor].push({ month: r.m, total: parseFloat(r.total) });
    });
    for (const [vendor, vals] of Object.entries(data)) {
      if (vals.length <= 1) continue;
      const totals = vals.map((v) => v.total);
      const last = totals[totals.length - 1];
      const prev = totals.slice(0, -1);
      const mean = prev.reduce((a, b) => a + b, 0) / prev.length;
      const variance = prev.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prev.length;
      const sd = Math.sqrt(variance);
      if (!sd) continue;
      const diff = last - mean;
      if (diff <= 0) continue;
      const vendorSettings = model?.vendors?.[vendor];
      const threshold = vendorSettings?.threshold ?? baseThreshold;
      const yellowThreshold = Math.max(1, threshold * 0.5);
      let tier = 'green';
      if (diff > threshold * sd) tier = 'red';
      else if (diff > yellowThreshold * sd) tier = 'yellow';
      if (diff > yellowThreshold * sd) {
        const message = `Anomaly (${tier}) for ${vendor}: $${last.toFixed(2)} vs avg $${mean.toFixed(2)}`;
        await pool.query(
          'INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)',
          [1, message, 'anomaly']
        );
        await sendSlackNotification?.(message);
        broadcastNotification?.(message);
      }
    }
  } catch (err) {
    console.error('Anomaly scan error:', err);
  }
}

function scheduleAnomalyScan() {
  cron.schedule('0 * * * *', () => scanAnomalies().catch(() => {}));
}

export { scheduleAnomalyScan, scanAnomalies };
