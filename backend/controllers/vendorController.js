const pool = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const axios = require('axios');

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
    await logActivity(req.user?.userId, 'update_vendor_notes');
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
