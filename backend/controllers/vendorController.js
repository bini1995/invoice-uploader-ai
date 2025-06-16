const pool = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const axios = require('axios');
const { parse } = require('json2csv');
const { parseCSV } = require('../utils/csvParser');

exports.listVendors = async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.vendor,
             MAX(i.date) AS last_invoice,
             SUM(i.amount) AS total_spend,
             v.notes
      FROM invoices i
      LEFT JOIN vendor_notes v ON LOWER(v.vendor) = LOWER(i.vendor)
      GROUP BY i.vendor, v.notes
      ORDER BY i.vendor
    `);
    const vendors = result.rows.map(r => ({
      vendor: r.vendor,
      last_invoice: r.last_invoice,
      total_spend: parseFloat(r.total_spend),
      notes: r.notes || ''
    }));
    res.json({ vendors });
  } catch (err) {
    console.error('List vendors error:', err);
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
};

exports.updateVendorNotes = async (req, res) => {
  const { vendor } = req.params;
  const { notes } = req.body;
  try {
    await pool.query(
      `INSERT INTO vendor_notes (vendor, notes)
       VALUES ($1, $2)
       ON CONFLICT (vendor) DO UPDATE SET notes = EXCLUDED.notes`,
      [vendor, notes || '']
    );
    await logActivity(req.user?.userId, 'update_vendor_notes', null, req.user?.username);
    res.json({ message: 'Notes updated' });
  } catch (err) {
    console.error('Update vendor notes error:', err);
    res.status(500).json({ message: 'Failed to update notes' });
  }
};

exports.getVendorInfo = async (req, res) => {
  const { vendor } = req.params;
  try {
    const wiki = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(vendor)}`);
    let description = wiki.data.extract || '';
    let risk = 'unknown';
    if (process.env.RISK_SCORE_URL) {
      const r = await axios.get(`${process.env.RISK_SCORE_URL}?q=${encodeURIComponent(vendor)}`);
      risk = r.data.risk || 'unknown';
    }
    res.json({ description, risk });
  } catch (err) {
    console.error('Vendor info error:', err.message);
    res.status(500).json({ message: 'Failed to fetch vendor info' });
  }
};

const levenshtein = require('fast-levenshtein');

exports.matchVendors = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Query parameter q required' });
  try {
    const result = await pool.query('SELECT DISTINCT vendor FROM invoices');
    const threshold = Math.max(2, Math.floor(q.length * 0.4));
    const matches = result.rows
      .map(r => r.vendor)
      .map(v => ({ vendor: v, distance: levenshtein.get(v.toLowerCase(), q.toLowerCase()) }))
      .filter(v => v.distance <= threshold)
      .sort((a, b) => a.distance - b.distance)
      .map(v => v.vendor);
    res.json({ matches });
  } catch (err) {
    console.error('Vendor match error:', err);
    res.status(500).json({ message: 'Failed to match vendors' });
  }
};

exports.predictVendorBehavior = async (req, res) => {
  const { vendor } = req.params;
  try {
    const result = await pool.query(
      'SELECT date, amount FROM invoices WHERE LOWER(vendor)=LOWER($1) ORDER BY date',
      [vendor]
    );
    if (result.rows.length < 2) {
      return res.json({ message: 'Not enough data to predict' });
    }
    const dates = result.rows.map((r) => new Date(r.date));
    const amounts = result.rows.map((r) => parseFloat(r.amount));
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i] - dates[i - 1]) / (24 * 60 * 60 * 1000));
    }
    const avgInterval =
      intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const nextDate = new Date(
      dates[dates.length - 1].getTime() + avgInterval * 24 * 60 * 60 * 1000
    );
    res.json({
      predicted_date: nextDate.toISOString().split('T')[0],
      predicted_amount: parseFloat(avgAmount.toFixed(2)),
    });
  } catch (err) {
    console.error('Vendor prediction error:', err);
    res.status(500).json({ message: 'Failed to predict vendor behavior' });
  }
};

exports.exportVendorsCSV = async (_req, res) => {
  try {
    const result = await pool.query('SELECT vendor, notes FROM vendor_notes');
    const csv = parse(result.rows, { fields: ['vendor', 'notes'] });
    res.header('Content-Type', 'text/csv');
    res.attachment('vendors.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Vendor export error:', err);
    res.status(500).json({ message: 'Failed to export vendors' });
  }
};

exports.importVendorsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const rows = await parseCSV(req.file.path);
    for (const row of rows) {
      const vendor = row.vendor || row.name;
      if (!vendor) continue;
      await pool.query(
        `INSERT INTO vendor_notes (vendor, notes)
         VALUES ($1, $2)
         ON CONFLICT (vendor) DO UPDATE SET notes = EXCLUDED.notes`,
        [vendor, row.notes || '']
      );
    }
    res.json({ imported: rows.length });
  } catch (err) {
    console.error('Vendor import error:', err);
    res.status(500).json({ message: 'Failed to import vendors' });
  }
};
