import pool from '../config/db.js';
import { runPythonExplain } from '../utils/anomalyExplainer.js';

export const getAnomalyExplainability = async (req, res) => {
  try {
    const limit = Number(req.query?.limit) || 200;
    const contamination = Number(req.query?.contamination) || 0.12;

    const { rows } = await pool.query(
      `SELECT vendor, DATE_TRUNC('month', date) AS period, SUM(amount) AS total
       FROM invoices
       WHERE vendor IS NOT NULL AND date IS NOT NULL
       GROUP BY vendor, period
       ORDER BY vendor, period
       LIMIT $1`,
      [limit]
    );

    const points = rows.map((row) => [Number.parseFloat(row.total) || 0]);
    let explain = null;
    try {
      explain = await runPythonExplain({ points, contamination });
    } catch (err) {
      const message = err.message || 'Python explain failed';
      const isMissingDeps = /no module named/i.test(message);
      return res.status(isMissingDeps ? 503 : 500).json({
        message: 'Failed to run isolation forest explainability',
        error: message,
      });
    }

    res.json({
      samples: rows,
      isolation_forest: {
        scores: explain.scores,
        labels: explain.labels,
      },
      shap: explain.shap,
      shap_error: explain.shap_error || null,
    });
  } catch (err) {
    console.error('Explain anomaly error:', err);
    res.status(500).json({ message: 'Failed to explain anomalies' });
  }
};
