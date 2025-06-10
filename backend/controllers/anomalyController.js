const pool = require('../config/db');

exports.getAnomalies = async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  try {
    const result = await pool.query(
      `SELECT vendor, DATE_TRUNC('month', date) AS m, SUM(amount) AS total
       FROM invoices
       WHERE date >= $1
       GROUP BY vendor, m
       ORDER BY vendor, m`,
      [start]
    );
    const data = {};
    result.rows.forEach(r => {
      const v = r.vendor;
      if (!data[v]) data[v] = [];
      data[v].push({ month: r.m, total: parseFloat(r.total) });
    });
    const anomalies = [];
    for (const [vendor, rows] of Object.entries(data)) {
      const totals = rows.map(r => r.total);
      const avg = totals.reduce((a,b)=>a+b,0) / totals.length;
      const last = totals[totals.length - 1];
      if (totals.length > 1 && last > avg * 1.5) {
        anomalies.push({ vendor, avg, last });
      }
    }
    res.json({ anomalies });
  } catch (err) {
    console.error('Anomaly detection error:', err);
    res.status(500).json({ message: 'Failed to detect anomalies' });
  }
};
