const pool = require('../config/db');

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
