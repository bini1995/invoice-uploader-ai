import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = path.join(__dirname, '..', 'data', 'anomaly_model.json');

function computeStats(values) {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const sd = Math.sqrt(variance);
  return { mean, sd };
}

function adjustThreshold(baseThreshold, feedback, stats) {
  let threshold = baseThreshold;
  if (!stats.sd) return threshold;
  for (const entry of feedback) {
    const z = (entry.amount - stats.mean) / stats.sd;
    if (!Number.isFinite(z)) continue;
    if (entry.is_anomaly) {
      threshold = Math.min(threshold, Math.max(0.5, z));
    } else {
      threshold = Math.max(threshold, z + 0.1);
    }
  }
  return threshold;
}

async function trainAnomalyModel({ baseThreshold = 2 } = {}) {
  const { rows } = await pool.query(
    `SELECT vendor, DATE_TRUNC('month', date) AS period, SUM(amount) AS total
     FROM invoices
     WHERE vendor IS NOT NULL AND date IS NOT NULL
     GROUP BY vendor, period
     ORDER BY vendor, period`
  );
  const totalsByVendor = new Map();
  for (const row of rows) {
    const vendor = row.vendor;
    const amount = parseFloat(row.total);
    if (!Number.isFinite(amount)) continue;
    if (!totalsByVendor.has(vendor)) totalsByVendor.set(vendor, []);
    totalsByVendor.get(vendor).push(amount);
  }

  const { rows: feedbackRows } = await pool.query(
    `SELECT vendor, amount, is_anomaly
     FROM anomaly_feedback
     WHERE vendor IS NOT NULL AND amount IS NOT NULL`
  );
  const feedbackByVendor = feedbackRows.reduce((acc, row) => {
    if (!acc[row.vendor]) acc[row.vendor] = [];
    acc[row.vendor].push({
      amount: parseFloat(row.amount),
      is_anomaly: row.is_anomaly,
    });
    return acc;
  }, {});

  const model = {
    version: 1,
    trainedAt: new Date().toISOString(),
    baseThreshold,
    vendors: {},
  };

  for (const [vendor, totals] of totalsByVendor.entries()) {
    if (totals.length < 2) continue;
    const stats = computeStats(totals);
    const feedback = feedbackByVendor[vendor] || [];
    const threshold = adjustThreshold(baseThreshold, feedback, stats);
    model.vendors[vendor] = {
      mean: stats.mean,
      sd: stats.sd,
      threshold,
      feedbackCount: feedback.length,
    };
  }

  fs.writeFileSync(MODEL_PATH, JSON.stringify(model, null, 2));
  return {
    modelPath: MODEL_PATH,
    vendors: Object.keys(model.vendors).length,
    feedbackCount: feedbackRows.length,
  };
}

function loadAnomalyModel() {
  try {
    if (!fs.existsSync(MODEL_PATH)) return null;
    return JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
  } catch (err) {
    console.error('Load anomaly model error:', err.message);
    return null;
  }
}

export { trainAnomalyModel, loadAnomalyModel };
