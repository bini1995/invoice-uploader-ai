import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

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

function runPythonIsolationForest(totals, contamination) {
  return new Promise((resolve, reject) => {
    const script = path.join(__dirname, 'pythonAnomalyExplain.py');
    const process = spawn('python3', [script], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Python exited with ${code}`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (err) {
        reject(err);
      }
    });

    process.stdin.write(JSON.stringify({
      points: totals.map((value) => [value]),
      contamination,
    }));
    process.stdin.end();
  });
}

async function trainAnomalyModel({ baseThreshold = 2, contamination = 0.12 } = {}) {
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
    version: 2,
    trainedAt: new Date().toISOString(),
    baseThreshold,
    contamination,
    vendors: {},
  };

  for (const [vendor, totals] of totalsByVendor.entries()) {
    if (totals.length < 2) continue;
    const stats = computeStats(totals);
    const feedback = feedbackByVendor[vendor] || [];
    const threshold = adjustThreshold(baseThreshold, feedback, stats);

    let isolationForest = null;
    try {
      isolationForest = await runPythonIsolationForest(totals, contamination);
    } catch (err) {
      console.error('Isolation forest training error:', err.message);
    }

    model.vendors[vendor] = {
      mean: stats.mean,
      sd: stats.sd,
      threshold,
      feedbackCount: feedback.length,
      isolationForest,
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
