const pool = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const { encryptSensitive, decryptSensitive } = require('../utils/encryption');
const axios = require('axios');
const { parse } = require('json2csv');
const { parseCSV } = require('../utils/csvParser');
const countryRisk = {
  high: ['Russia', 'Iran', 'North Korea'],
  medium: ['Mexico', 'Brazil', 'India'],
};

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
      notes: r.notes ? decryptSensitive(r.notes) : ''
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
      [vendor, encryptSensitive(notes || '')]
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

exports.aiVendorMatch = async (req, res) => {
  const { vendor, invoice_id, invoice_number, amount } = req.body || {};
  if (!vendor)
    return res.status(400).json({ message: 'Missing vendor text.' });
  try {
    const result = await pool.query('SELECT DISTINCT vendor FROM invoices');
    const matches = result.rows
      .map((r) => ({
        vendor: r.vendor,
        distance: levenshtein.get(r.vendor.toLowerCase(), vendor.toLowerCase()),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    let best = matches[0];
    let suggestion = best.vendor;
    let confidence = 1 - best.distance / Math.max(best.vendor.length, vendor.length);

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = `Vendor text: "${vendor}". Possible matches: ${matches
          .map((m) => m.vendor)
          .join(', ')}. Invoice #: ${invoice_number || 'unknown'}, Amount: $$
          {amount || 'unknown'}. Respond with JSON {"vendor": "name", "confidence": 0-1}.`;
        const aiRes = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You pick the best vendor match.' },
              { role: 'user', content: prompt },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://github.com/bini1995/invoice-uploader-ai',
              'X-Title': 'invoice-uploader-ai',
            },
          }
        );
        const parsed = JSON.parse(aiRes.data.choices?.[0]?.message?.content || '{}');
        if (parsed.vendor) suggestion = parsed.vendor;
        if (parsed.confidence) confidence = parseFloat(parsed.confidence);
      } catch (e) {
        console.error('AI vendor match error:', e.response?.data || e.message);
      }
    }

    const insert = await pool.query(
      `INSERT INTO vendor_suggestions (invoice_id, input_vendor, suggested_vendor, confidence)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [invoice_id || null, vendor, suggestion, confidence]
    );

    res.json({ suggestion_id: insert.rows[0].id, vendor: suggestion, confidence });
  } catch (err) {
    console.error('Vendor AI match error:', err);
    res.status(500).json({ message: 'Failed to match vendor' });
  }
};

exports.vendorMatchFeedback = async (req, res) => {
  const { id } = req.params;
  const { accepted } = req.body || {};
  if (!id || typeof accepted === 'undefined') {
    return res.status(400).json({ message: 'Missing suggestion id or accepted' });
  }
  try {
    await pool.query('UPDATE vendor_suggestions SET accepted = $1 WHERE id = $2', [accepted, id]);
    res.json({ message: 'Feedback recorded' });
  } catch (err) {
    console.error('Vendor match feedback error:', err);
    res.status(500).json({ message: 'Failed to record feedback' });
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

// Deep vendor behavior analytics
exports.getBehaviorFlags = async (_req, res) => {
  try {
    const now = new Date();
    const budgetRes = await pool.query(
      "SELECT vendor, amount FROM budgets WHERE period='monthly' AND vendor IS NOT NULL"
    );
    const flagged = {};
    for (const b of budgetRes.rows) {
      let exceed = 0;
      for (let i = 1; i <= 3; i++) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const r = await pool.query(
          'SELECT SUM(amount) AS total FROM invoices WHERE vendor=$1 AND date >= $2 AND date < $3',
          [b.vendor, start, end]
        );
        const total = parseFloat(r.rows[0].total) || 0;
        if (total > parseFloat(b.amount)) exceed++;
      }
      if (exceed >= 2) flagged[b.vendor] = ['budget_exceeded'];
    }

    const payRes = await pool.query(
      `SELECT vendor, COUNT(*) AS cnt, AVG(GREATEST(0, EXTRACT(DAY FROM NOW() - due_date))) AS avg_late
       FROM invoices
       WHERE due_date IS NOT NULL AND due_date < NOW() AND payment_status != 'Paid'
       GROUP BY vendor`
    );
    payRes.rows.forEach((r) => {
      if (parseInt(r.cnt, 10) >= 3 || parseFloat(r.avg_late) > 15) {
        flagged[r.vendor] = flagged[r.vendor]
          ? [...flagged[r.vendor], 'payment_delay']
          : ['payment_delay'];
      }
    });

    const bankRes = await pool.query(
      `SELECT username AS vendor, COUNT(*) AS changes
       FROM activity_logs
       WHERE action='change_bank_info' AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY username`
    );
    bankRes.rows.forEach((r) => {
      if (parseInt(r.changes, 10) > 1) {
        flagged[r.vendor] = flagged[r.vendor]
          ? [...flagged[r.vendor], 'bank_changes']
          : ['bank_changes'];
      }
    });

    const flags = Object.entries(flagged).map(([vendor, reasons]) => ({ vendor, reasons }));
    res.json({ flags });
  } catch (err) {
    console.error('Behavior flags error:', err);
    res.status(500).json({ message: 'Failed to analyze vendor behavior' });
  }
};

// Detailed vendor profile with invoices and analytics
exports.getVendorAnalytics = async (req, res) => {
  const { vendor } = req.params;
  try {
    const invoicesRes = await pool.query(
      'SELECT * FROM invoices WHERE LOWER(vendor)=LOWER($1) ORDER BY date DESC',
      [vendor]
    );
    const spendRes = await pool.query(
      `SELECT DATE_TRUNC('month', date) AS month, SUM(amount) AS total
       FROM invoices WHERE LOWER(vendor)=LOWER($1)
       GROUP BY month ORDER BY month`,
      [vendor]
    );
    const payRes = await pool.query(
      `SELECT EXTRACT(EPOCH FROM (updated_at - date))/86400 AS days
       FROM invoices WHERE LOWER(vendor)=LOWER($1) AND paid=TRUE AND updated_at IS NOT NULL`,
      [vendor]
    );
    const avgPay = payRes.rows.length
      ? payRes.rows.reduce((a, b) => a + parseFloat(b.days), 0) / payRes.rows.length
      : null;
    const riskRes = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE due_date < NOW() AND paid=FALSE) AS overdue, COUNT(*) AS total
       FROM invoices WHERE LOWER(vendor)=LOWER($1)`,
      [vendor]
    );
    const overdue = parseInt(riskRes.rows[0].overdue, 10);
    const total = parseInt(riskRes.rows[0].total, 10) || 1;
    const risk = Math.round((overdue / total) * 100);
    const quality = 100 - risk;
    res.json({
      invoices: invoicesRes.rows,
      avg_payment_time: avgPay,
      spend: spendRes.rows.map(r => ({ month: r.month, total: parseFloat(r.total) })),
      risk_score: risk,
      quality_score: quality,
    });
  } catch (err) {
    console.error('Vendor analytics error:', err);
    res.status(500).json({ message: 'Failed to fetch vendor profile' });
  }
};

exports.updateVendorCountry = async (req, res) => {
  const { vendor } = req.params;
  const { country } = req.body || {};
  if (!country) return res.status(400).json({ message: 'country required' });
  try {
    await pool.query(
      `INSERT INTO vendor_profiles (vendor, country)
       VALUES ($1,$2)
       ON CONFLICT (vendor) DO UPDATE SET country = EXCLUDED.country`,
      [vendor, country]
    );
    res.json({ message: 'Country updated' });
  } catch (err) {
    console.error('Vendor country update error:', err);
    res.status(500).json({ message: 'Failed to update country' });
  }
};

exports.getVendorRiskProfile = async (req, res) => {
  const { vendor } = req.params;
  try {
    const invoicesRes = await pool.query(
      'SELECT date, amount FROM invoices WHERE LOWER(vendor)=LOWER($1)',
      [vendor]
    );
    if (!invoicesRes.rows.length) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    const countryRes = await pool.query(
      'SELECT country FROM vendor_profiles WHERE vendor=$1',
      [vendor]
    );
    const country = countryRes.rows[0]?.country || 'Unknown';
    const months = {};
    let total = 0;
    invoicesRes.rows.forEach((r) => {
      const m = `${r.date.getFullYear()}-${r.date.getMonth() + 1}`;
      months[m] = (months[m] || 0) + 1;
      total += parseFloat(r.amount || 0);
    });
    const freq = Object.values(months).reduce((a, b) => a + b, 0) /
      Object.keys(months).length;
    const avgAmount = total / invoicesRes.rows.length;
    let risk = 0;
    if (freq > 5) risk += 20; else if (freq > 2) risk += 10;
    if (avgAmount > 5000) risk += 20; else if (avgAmount > 1000) risk += 10;
    if (countryRisk.high.includes(country)) risk += 50;
    else if (countryRisk.medium.includes(country)) risk += 20;
    if (risk > 100) risk = 100;
    res.json({ vendor, country, avg_amount: Number(avgAmount.toFixed(2)), monthly_frequency: Number(freq.toFixed(2)), risk });
  } catch (err) {
    console.error('Vendor risk error:', err);
    res.status(500).json({ message: 'Failed to compute risk' });
  }
};
