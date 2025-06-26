const pool = require('../config/db');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { loadReportSchedules } = require('../utils/reportScheduler');

function buildFilterQuery({ vendor, department, startDate, endDate, minAmount, maxAmount }) {
  const params = [];
  const conditions = [];
  if (vendor) {
    params.push(`%${vendor}%`);
    conditions.push(`LOWER(vendor) LIKE LOWER($${params.length})`);
  }
  if (department) {
    params.push(`%${department}%`);
    conditions.push(`LOWER(department) LIKE LOWER($${params.length})`);
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

exports.buildFilterQuery = buildFilterQuery;

exports.getReport = async (req, res) => {
  const { vendor, department, startDate, endDate, minAmount, maxAmount } = req.query;
  const { where, params } = buildFilterQuery({ vendor, department, startDate, endDate, minAmount, maxAmount });
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
  const { vendor, department, startDate, endDate, minAmount, maxAmount } = req.query;
  const { where, params } = buildFilterQuery({ vendor, department, startDate, endDate, minAmount, maxAmount });
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

exports.getApprovalStats = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const result = await pool.query(
      `SELECT DATE(created_at) AS d, COUNT(*) AS c
       FROM activity_logs
       WHERE user_id = $1
         AND action IN ('approve_invoice','bulk_approve')
         AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY d`,
      [userId]
    );
    const total = result.rows.reduce((t, r) => t + parseInt(r.c, 10), 0);
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const dateStr = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
        .toISOString()
        .slice(0, 10);
      const found = result.rows.find((r) => r.d.toISOString().slice(0, 10) === dateStr);
      if (found) streak += 1;
      else break;
    }
    res.json({ total, streak });
  } catch (err) {
    console.error('Approval stats error:', err);
    res.status(500).json({ message: 'Failed to fetch approval stats' });
  }
};

// Aggregate metadata for adaptive dashboard
exports.getDashboardMetadata = async (_req, res) => {
  try {
    const vendorRes = await pool.query('SELECT COUNT(DISTINCT vendor) AS count FROM invoices');
    const flaggedRes = await pool.query('SELECT COUNT(*) AS count FROM invoices WHERE flagged = TRUE');
    const procRes = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (COALESCE(updated_at, NOW()) - created_at))) AS avg_seconds
       FROM invoices WHERE updated_at IS NOT NULL`
    );
    const avgSeconds = parseFloat(procRes.rows[0].avg_seconds) || 0;
    res.json({
      totalVendors: parseInt(vendorRes.rows[0].count, 10) || 0,
      flaggedItems: parseInt(flaggedRes.rows[0].count, 10) || 0,
      avgProcessingHours: +(avgSeconds / 3600).toFixed(2)
    });
  } catch (err) {
    console.error('Dashboard metadata error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard metadata' });
  }
};

// Average approval times for charting
exports.getApprovalTimeChart = async (req, res) => {
  const { startDate, endDate } = req.query;
  const params = [];
  const conditions = ["approval_status = 'Approved'"]; 
  if (startDate) { params.push(startDate); conditions.push(`created_at >= $${params.length}`); }
  if (endDate) { params.push(endDate); conditions.push(`created_at <= $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const result = await pool.query(
      `SELECT id, EXTRACT(EPOCH FROM (updated_at - created_at))/3600 AS hours FROM invoices ${where}`,
      params
    );
    const data = result.rows.map(r => ({ id: r.id, hours: parseFloat(r.hours) }));
    res.json({ approvals: data });
  } catch (err) {
    console.error('Approval time error:', err);
    res.status(500).json({ message: 'Failed to fetch approval times' });
  }
};

// Spending totals grouped by vendor
exports.getVendorSpend = async (req, res) => {
  const { startDate, endDate } = req.query;
  const params = [];
  const conditions = [];
  if (startDate) { params.push(startDate); conditions.push(`date >= $${params.length}`); }
  if (endDate) { params.push(endDate); conditions.push(`date <= $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const result = await pool.query(
      `SELECT vendor, SUM(amount) AS total FROM invoices ${where} GROUP BY vendor ORDER BY vendor`,
      params
    );
    const rows = result.rows.map(r => ({ vendor: r.vendor, total: parseFloat(r.total) }));
    res.json({ byVendor: rows });
  } catch (err) {
    console.error('Vendor spend error:', err);
    res.status(500).json({ message: 'Failed to fetch spend by vendor' });
  }
};

// Export report as Excel
exports.exportReportExcel = async (req, res) => {
  const { vendor, department, startDate, endDate, minAmount, maxAmount } = req.query;
  const { where, params } = buildFilterQuery({ vendor, department, startDate, endDate, minAmount, maxAmount });
  try {
    const result = await pool.query(
      `SELECT invoice_number, date, vendor, amount FROM invoices ${where} ORDER BY date DESC`,
      params
    );
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    sheet.columns = [
      { header: 'Invoice', key: 'invoice_number' },
      { header: 'Date', key: 'date' },
      { header: 'Vendor', key: 'vendor' },
      { header: 'Amount', key: 'amount' }
    ];
    result.rows.forEach(r => sheet.addRow(r));
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
    res.send(buffer);
  } catch (err) {
    console.error('Report Excel error:', err);
    res.status(500).json({ message: 'Failed to export report' });
  }
};

// Outlier detection on invoice amounts
exports.detectOutliers = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, vendor, amount, date FROM invoices WHERE date >= NOW() - INTERVAL '90 days'"
    );
    const amounts = rows.map(r => parseFloat(r.amount));
    if (!amounts.length) return res.json({ outliers: [] });
    const mean = amounts.reduce((a,b) => a+b,0) / amounts.length;
    const sd = Math.sqrt(amounts.reduce((s,a) => s + Math.pow(a-mean,2),0) / amounts.length);
    const threshold = mean + sd * 3;
    const outliers = rows.filter(r => parseFloat(r.amount) > threshold);
    res.json({ mean, sd, threshold, outliers });
  } catch (err) {
    console.error('Outlier detection error:', err);
    res.status(500).json({ message: 'Failed to detect outliers' });
  }
};

// Real-time dashboard metrics
exports.getRealTimeDashboard = async (_req, res) => {
  try {
    const processed = await pool.query(
      "SELECT COUNT(*) FROM invoices WHERE created_at >= NOW() - INTERVAL '1 day'"
    );
    const avgRes = await pool.query(
      "SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) AS hours FROM invoices WHERE approval_status='Approved' AND updated_at >= NOW() - INTERVAL '1 day'"
    );
    const errors = await pool.query(
      "SELECT COUNT(*) FROM invoices WHERE flagged=TRUE AND created_at >= NOW() - INTERVAL '1 day'"
    );
    res.json({
      processedToday: parseInt(processed.rows[0].count,10) || 0,
      avgApprovalHours: parseFloat(avgRes.rows[0].hours) || 0,
      errorsToday: parseInt(errors.rows[0].count,10) || 0
    });
  } catch (err) {
    console.error('Realtime dashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
};

// Detect duplicate invoices
exports.detectDuplicateInvoices = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT invoice_number, vendor, amount, COUNT(*) AS c
       FROM invoices
       GROUP BY invoice_number, vendor, amount
       HAVING COUNT(*) > 1`
    );
    res.json({ duplicates: rows });
  } catch (err) {
    console.error('Duplicate detection error:', err);
    res.status(500).json({ message: 'Failed to detect duplicates' });
  }
};

// Simple cash flow forecast using moving average
exports.forecastCashFlow = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DATE_TRUNC('month', COALESCE(due_date, date)) AS m, SUM(amount) AS total
       FROM invoices
       GROUP BY m
       ORDER BY m DESC
       LIMIT 6`
    );
    const history = rows.map(r => ({ month: r.m, total: parseFloat(r.total) })).reverse();
    const avg = history.reduce((a,b) => a + b.total, 0) / (history.length || 1);
    res.json({ history, forecastNextMonth: avg });
  } catch (err) {
    console.error('Cash flow forecast error:', err);
    res.status(500).json({ message: 'Failed to forecast cash flow' });
  }
};

// Average approval time grouped by vendor
exports.getApprovalTimeByVendor = async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT vendor,
             AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) AS hours
      FROM invoices
      WHERE approval_status = 'Approved'
      GROUP BY vendor
      ORDER BY vendor`);
    const rows = result.rows.map(r => ({
      vendor: r.vendor,
      hours: parseFloat(r.hours)
    }));
    res.json({ data: rows });
  } catch (err) {
    console.error('Approval time by vendor error:', err);
    res.status(500).json({ message: 'Failed to fetch approval times by vendor' });
  }
};

// Trend of late payments over time
exports.getLatePaymentTrend = async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', due_date) AS month,
             COUNT(*) AS late_count
      FROM invoices
      WHERE due_date IS NOT NULL
        AND due_date < NOW()
        AND payment_status != 'Paid'
      GROUP BY month
      ORDER BY month`);
    const rows = result.rows.map(r => ({
      month: r.month,
      late: parseInt(r.late_count, 10)
    }));
    res.json({ trend: rows });
  } catch (err) {
    console.error('Late payments trend error:', err);
    res.status(500).json({ message: 'Failed to fetch late payments trend' });
  }
};

// Departments or vendors that exceeded their budgets
exports.getInvoicesOverBudget = async (_req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  try {
    const budgetRes = await pool.query(
      `SELECT vendor, tag AS department, amount
         FROM budgets
        WHERE period='monthly'`
    );
    const over = [];
    for (const b of budgetRes.rows) {
      let spent = 0;
      if (b.vendor) {
        const r = await pool.query(
          'SELECT SUM(amount) AS s FROM invoices WHERE vendor=$1 AND date >= $2 AND date < $3',
          [b.vendor, start, end]
        );
        spent = parseFloat(r.rows[0].s) || 0;
      } else if (b.department) {
        const r = await pool.query(
          'SELECT SUM(amount) AS s FROM invoices WHERE department=$1 AND date >= $2 AND date < $3',
          [b.department, start, end]
        );
        spent = parseFloat(r.rows[0].s) || 0;
      }
      if (spent > parseFloat(b.amount)) {
        over.push({
          vendor: b.vendor,
          department: b.department,
          budget: parseFloat(b.amount),
          spent
        });
      }
    }
    res.json({ overBudget: over });
  } catch (err) {
    console.error('Over budget error:', err);
    res.status(500).json({ message: 'Failed to check budgets' });
  }
};

// Risk heatmap showing vendors with many flagged or overdue invoices
exports.getRiskHeatmap = async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT vendor,
             COUNT(*) FILTER (WHERE flagged OR (due_date < NOW() AND payment_status != 'Paid')) AS risk,
             COUNT(*) AS total
        FROM invoices
       GROUP BY vendor`);
    const data = result.rows.map(r => ({
      vendor: r.vendor,
      riskScore: parseFloat(r.total ? r.risk / r.total : 0)
    }));
    res.json({ heatmap: data });
  } catch (err) {
    console.error('Risk heatmap error:', err);
    res.status(500).json({ message: 'Failed to build risk heatmap' });
  }
};

// Simple clustering of invoices by vendor name and amount similarity
exports.getInvoiceClusters = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, vendor, amount FROM invoices');
    const clusters = [];
    const used = new Set();
    const dist = (a, b) => {
      const nameDist = require('fast-levenshtein').get(a.vendor.toLowerCase(), b.vendor.toLowerCase());
      const amountDiff = Math.abs(parseFloat(a.amount) - parseFloat(b.amount));
      const amountAvg = (parseFloat(a.amount) + parseFloat(b.amount)) / 2 || 1;
      return nameDist + amountDiff / amountAvg;
    };
    for (let i = 0; i < rows.length; i++) {
      if (used.has(rows[i].id)) continue;
      const cluster = [rows[i]];
      used.add(rows[i].id);
      for (let j = i + 1; j < rows.length; j++) {
        if (used.has(rows[j].id)) continue;
        if (dist(rows[i], rows[j]) < 3) {
          cluster.push(rows[j]);
          used.add(rows[j].id);
        }
      }
      if (cluster.length > 1) clusters.push(cluster.map(c => c.id));
    }
    res.json({ clusters });
  } catch (err) {
    console.error('Invoice clustering error:', err);
    res.status(500).json({ message: 'Failed to cluster invoices' });
  }
};

// Heatmap of invoice volume over time
exports.getSpendHeatmap = async (req, res) => {
  const { vendor, department, startDate, endDate, minAmount, maxAmount } = req.query;
  const { where, params } = buildFilterQuery({ vendor, department, startDate, endDate, minAmount, maxAmount });
  try {
    const result = await pool.query(
      `SELECT date::date AS day, COUNT(*) AS count FROM invoices ${where} GROUP BY day ORDER BY day`,
      params
    );
    const heatmap = result.rows.map(r => ({ day: r.day.toISOString().slice(0, 10), count: parseInt(r.count, 10) }));
    res.json({ heatmap });
  } catch (err) {
    console.error('Spend heatmap error:', err);
    res.status(500).json({ message: 'Failed to build spend heatmap' });
  }
};

exports.listReportSchedules = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM report_schedules ORDER BY id DESC');
    res.json({ schedules: rows });
  } catch (err) {
    console.error('List report schedules error:', err);
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
};

exports.createReportSchedule = async (req, res) => {
  const { email, vendor, department, start_date, end_date, cron } = req.body || {};
  if (!email) return res.status(400).json({ message: 'email required' });
  try {
    const result = await pool.query(
      `INSERT INTO report_schedules (email, vendor, department, start_date, end_date, cron) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [email, vendor || null, department || null, start_date || null, end_date || null, cron || '0 8 * * *']
    );
    await loadReportSchedules();
    res.json({ schedule: result.rows[0] });
  } catch (err) {
    console.error('Create report schedule error:', err);
    res.status(500).json({ message: 'Failed to create schedule' });
  }
};

exports.deleteReportSchedule = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM report_schedules WHERE id = $1', [id]);
    await loadReportSchedules();
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    console.error('Delete report schedule error:', err);
    res.status(500).json({ message: 'Failed to delete schedule' });
  }
};
