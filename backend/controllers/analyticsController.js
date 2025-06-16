const pool = require('../config/db');
const PDFDocument = require('pdfkit');

function buildFilterQuery({ vendor, startDate, endDate, minAmount, maxAmount }) {
  const params = [];
  const conditions = [];
  if (vendor) {
    params.push(`%${vendor}%`);
    conditions.push(`LOWER(vendor) LIKE LOWER($${params.length})`);
  }
  if (startDate) {
    params.push(startDate);
    conditions.push(`date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`date <= $${params.length}`);
  }
  if (minAmount) {
    params.push(minAmount);
    conditions.push(`amount >= $${params.length}`);
  }
  if (maxAmount) {
    params.push(maxAmount);
    conditions.push(`amount <= $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

exports.getReport = async (req, res) => {
  const { vendor, startDate, endDate, minAmount, maxAmount } = req.query;
  const { where, params } = buildFilterQuery({ vendor, startDate, endDate, minAmount, maxAmount });
  try {
    const result = await pool.query(
      `SELECT id, invoice_number, date, vendor, amount FROM invoices ${where} ORDER BY date DESC`,
      params
    );
    res.json({ invoices: result.rows });
  } catch (err) {
    console.error('Analytics report error:', err);
    res.status(500).json({ message: 'Failed to fetch report' });
  }
};

exports.exportReportPDF = async (req, res) => {
  const { vendor, startDate, endDate, minAmount, maxAmount } = req.query;
  const { where, params } = buildFilterQuery({ vendor, startDate, endDate, minAmount, maxAmount });
  try {
    const result = await pool.query(
      `SELECT invoice_number, date, vendor, amount FROM invoices ${where} ORDER BY date DESC`,
      params
    );
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    doc.pipe(res);
    doc.fontSize(18).text('Invoice Report', { align: 'center' });
    doc.moveDown();
    result.rows.forEach((inv) => {
      doc.fontSize(12).text(`Invoice #${inv.invoice_number}`);
      doc.text(`Date: ${inv.date}`);
      doc.text(`Vendor: ${inv.vendor}`);
      doc.text(`Amount: $${parseFloat(inv.amount).toFixed(2)}`);
      doc.moveDown();
    });
    doc.end();
  } catch (err) {
    console.error('Report PDF error:', err);
    res.status(500).json({ message: 'Failed to export report' });
  }
};

// Monthly spending trends
exports.getTrends = async (req, res) => {
  const { startDate, endDate } = req.query;
  const params = [];
  const conditions = [];
  if (startDate) {
    params.push(startDate);
    conditions.push(`date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`date <= $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', date) AS month, SUM(amount) AS total
       FROM invoices ${where}
       GROUP BY month
       ORDER BY month`,
      params
    );
    const trends = result.rows.map(r => ({
      month: r.month,
      total: parseFloat(r.total)
    }));
    res.json({ trends });
  } catch (err) {
    console.error('Trend report error:', err);
    res.status(500).json({ message: 'Failed to fetch trend report' });
  }
};

// Aging invoices breakdown
exports.getAgingReport = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, invoice_number, vendor, amount, due_date FROM invoices WHERE due_date IS NOT NULL`
    );
    const now = new Date();
    const buckets = { current: [], '1-30': [], '31-60': [], '61-90': [], '90+': [] };
    rows.forEach(r => {
      const due = new Date(r.due_date);
      const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
      const entry = {
        id: r.id,
        invoice_number: r.invoice_number,
        vendor: r.vendor,
        amount: parseFloat(r.amount),
        daysOverdue: diff
      };
      if (diff <= 0) buckets.current.push(entry);
      else if (diff <= 30) buckets['1-30'].push(entry);
      else if (diff <= 60) buckets['31-60'].push(entry);
      else if (diff <= 90) buckets['61-90'].push(entry);
      else buckets['90+'].push(entry);
    });
    res.json({ buckets });
  } catch (err) {
    console.error('Aging report error:', err);
    res.status(500).json({ message: 'Failed to fetch aging report' });
  }
};

// Predict cash-flow risk using a simple trend model
exports.predictCashFlowRisk = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DATE_TRUNC('month', COALESCE(due_date, date)) AS m, SUM(amount) AS total
       FROM invoices
       GROUP BY m
       ORDER BY m`
    );
    const totals = rows.map(r => parseFloat(r.total));
    if (totals.length < 2) {
      return res.json({ months: [], predictedNextMonth: 0, trend: 'insufficient data' });
    }
    const n = totals.length;
    const xMean = (n - 1) / 2;
    const yMean = totals.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (totals[i] - yMean);
      den += (i - xMean) * (i - xMean);
    }
    const slope = den ? num / den : 0;
    const predicted = yMean + slope * (n - xMean);
    const trend = predicted < 0 ? 'negative' : slope < 0 ? 'decreasing' : 'increasing';
    res.json({
      months: rows.map(r => ({ month: r.m, total: parseFloat(r.total) })),
      predictedNextMonth: predicted,
      trend
    });
  } catch (err) {
    console.error('Cash flow ML error:', err);
    res.status(500).json({ message: 'Failed to predict cash flow' });
  }
};
