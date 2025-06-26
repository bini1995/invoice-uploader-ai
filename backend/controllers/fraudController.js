const pool = require('../config/db');
const { detectAnomalies } = require('../utils/mlDetector');

exports.detectPatterns = async (req, res) => {
  try {
    const repeatedRes = await pool.query(`
      SELECT vendor, amount, COUNT(*) AS count, MIN(created_at) AS first_seen
      FROM invoices
      GROUP BY vendor, amount
      HAVING COUNT(*) > 1
    `);
    const totalsRes = await pool.query('SELECT vendor, COUNT(*) AS total FROM invoices GROUP BY vendor');
    const totals = {};
    totalsRes.rows.forEach(r => { totals[r.vendor] = parseInt(r.total, 10); });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const repeatedAmounts = repeatedRes.rows
      .filter(r => (totals[r.vendor] || 0) <= 3 && new Date(r.first_seen) > thirtyDaysAgo)
      .map(r => ({ vendor: r.vendor, amount: parseFloat(r.amount), count: parseInt(r.count, 10) }));

    const vendorRes = await pool.query('SELECT DISTINCT vendor FROM invoices');
    const domainMap = {};
    vendorRes.rows.forEach(r => {
      const base = r.vendor.toLowerCase().replace(/\d+/g, '');
      domainMap[base] = domainMap[base] ? [...domainMap[base], r.vendor] : [r.vendor];
    });
    const similarDomainVendors = Object.values(domainMap).filter(list => list.length > 1);

    const offHoursRes = await pool.query(`
      SELECT id, vendor, amount, created_at
      FROM invoices
      WHERE EXTRACT(HOUR FROM created_at) < 8 OR EXTRACT(HOUR FROM created_at) > 18
      ORDER BY created_at DESC
    `);
    const offHoursUploads = offHoursRes.rows.map(r => ({
      id: r.id,
      vendor: r.vendor,
      amount: parseFloat(r.amount),
      created_at: r.created_at
    }));

    res.json({ repeatedAmounts, similarDomainVendors, offHoursUploads });
  } catch (err) {
    console.error('Fraud pattern detection error:', err);
    res.status(500).json({ message: 'Failed to detect fraud patterns' });
  }
};

exports.fraudHeatmap = async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT EXTRACT(DOW FROM created_at) AS dow,
             EXTRACT(HOUR FROM created_at) AS hour,
             COUNT(*) FILTER (WHERE flagged) AS flagged_count
      FROM invoices
      GROUP BY dow, hour
    `);
    const heatmap = result.rows.map(r => ({
      day: parseInt(r.dow, 10),
      hour: parseInt(r.hour, 10),
      flagged: parseInt(r.flagged_count, 10)
    }));
    res.json({ heatmap });
  } catch (err) {
    console.error('Fraud heatmap error:', err);
    res.status(500).json({ message: 'Failed to build fraud heatmap' });
  }
};

exports.flaggedInvoices = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, invoice_number, vendor, amount, date, flag_reason FROM invoices WHERE flagged = true ORDER BY id DESC'
    );
    res.json({ invoices: result.rows });
  } catch (err) {
    console.error('Flagged invoices fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch flagged invoices' });
  }
};

exports.mlDetect = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, vendor, amount, created_at FROM invoices'
    );
    const anomalies = detectAnomalies(rows);
    res.json({ anomalies });
  } catch (err) {
    console.error('ML fraud detection error:', err);
    res.status(500).json({ message: 'Failed to run ML detection' });
  }
};

exports.labelFraud = async (req, res) => {
  const { id } = req.params;
  const { label } = req.body || {};
  try {
    await pool.query(
      'INSERT INTO fraud_training (invoice_id, label) VALUES ($1,$2)',
      [id, !!label]
    );
    if (label) {
      await pool.query('UPDATE invoices SET flagged = TRUE WHERE id = $1', [id]);
    }
    res.json({ message: 'Label recorded' });
  } catch (err) {
    console.error('Label fraud error:', err);
    res.status(500).json({ message: 'Failed to record label' });
  }
};
