const pool = require('../config/db');
const { Parser } = require('json2csv');
const archiver = require('archiver');
const { maskSensitive } = require('../utils/sanitize');
const logger = require('../utils/logger');
const { exportAttemptCounter } = require('../metrics');

exports.getActivityLogs = async (req, res) => {
  try {
    const { start, end, vendor, action, limit } = req.query;

    let query = 'SELECT a.* FROM activity_logs a';
    const params = [];
    const conditions = [];
    let joinInvoices = false;
    if (vendor || req.user?.role === 'legal') joinInvoices = true;
    if (joinInvoices) query += ' JOIN invoices i ON a.invoice_id = i.id';
    if (vendor) {
      params.push(vendor);
      conditions.push(`LOWER(i.vendor) = LOWER($${params.length})`);
    }
    if (action) {
      params.push(action);
      conditions.push(`a.action = $${params.length}`);
    }
    if (start) {
      params.push(start);
      conditions.push(`a.created_at >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      conditions.push(`a.created_at <= $${params.length}`);
    }
    if (req.user?.role === 'legal') {
      conditions.push('i.flagged = TRUE');
    }
    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const lim = parseInt(limit, 10);
    const limitClause = lim ? ` LIMIT ${lim}` : '';
    const result = await pool.query(`${query}${where} ORDER BY a.created_at DESC${limitClause}`, params);
    const sanitized = result.rows.map((row) => ({
      ...row,
      action: maskSensitive(row.action)
    }));
    res.json(sanitized);
  } catch (err) {
    console.error('Log fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};

exports.getInvoiceTimeline = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM activity_logs WHERE invoice_id = $1 ORDER BY created_at',
      [id]
    );
    const sanitized = result.rows.map((row) => ({
      ...row,
      action: maskSensitive(row.action)
    }));
    res.json(sanitized);
  } catch (err) {
    console.error('Timeline fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch timeline' });
  }
};

exports.exportComplianceReport = async (_req, res) => {
  try {
    const logRes = await pool.query(
      'SELECT * FROM activity_logs ORDER BY created_at'
    );
    const invoiceRes = await pool.query(
      'SELECT * FROM invoices ORDER BY created_at'
    );
    const approvalRes = await pool.query(
      'SELECT id, approval_history FROM invoices ORDER BY id'
    );

    const parser = new Parser();
    const logsCsv = parser.parse(logRes.rows);
    const invoicesCsv = parser.parse(invoiceRes.rows);
    const approvalCsv = parser.parse(
      approvalRes.rows.map((r) => ({
        invoice_id: r.id,
        approval_history: JSON.stringify(r.approval_history || [])
      }))
    );

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="compliance_report.zip"'
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).end();
    });
    archive.pipe(res);
    archive.append(logsCsv, { name: 'activity_logs.csv' });
    archive.append(invoicesCsv, { name: 'invoice_history.csv' });
    archive.append(approvalCsv, { name: 'approval_trails.csv' });
    archive.finalize();
    logger.info('Compliance report exported');
    exportAttemptCounter.inc();
  } catch (err) {
    logger.error('Compliance export error:', err);
    res.status(500).json({ message: 'Failed to export compliance report' });
  }
};

exports.exportInvoiceHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await pool.query(
      'SELECT * FROM activity_logs WHERE invoice_id = $1 ORDER BY created_at',
      [id]
    );
    const parser = new Parser();
    const csv = parser.parse(logs.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${id}_history.csv"`);
    res.send(csv);
    logger.info('Invoice history exported', { id });
    exportAttemptCounter.inc();
  } catch (err) {
    logger.error('Invoice history export error:', err);
    res.status(500).json({ message: 'Failed to export invoice history' });
  }
};

exports.exportVendorHistory = async (req, res) => {
  const { vendor } = req.params;
  try {
    const logs = await pool.query(
      `SELECT a.* FROM activity_logs a JOIN invoices i ON a.invoice_id = i.id
       WHERE LOWER(i.vendor) = LOWER($1) ORDER BY a.created_at`,
      [vendor]
    );
    const parser = new Parser();
    const csv = parser.parse(logs.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="vendor_${vendor}_history.csv"`);
    res.send(csv);
    logger.info('Vendor history exported', { vendor });
    exportAttemptCounter.inc();
  } catch (err) {
    logger.error('Vendor history export error:', err);
    res.status(500).json({ message: 'Failed to export vendor history' });
  }
};

exports.exportActivityLogsCSV = async (req, res) => {
  try {
    const { start, end, vendor, action, limit } = req.query;
    let query = 'SELECT a.* FROM activity_logs a';
    const params = [];
    const conditions = [];
    let joinInvoices = false;
    if (vendor) joinInvoices = true;
    if (joinInvoices) query += ' JOIN invoices i ON a.invoice_id = i.id';
    if (vendor) {
      params.push(vendor);
      conditions.push(`LOWER(i.vendor) = LOWER($${params.length})`);
    }
    if (action) {
      params.push(action);
      conditions.push(`a.action = $${params.length}`);
    }
    if (start) {
      params.push(start);
      conditions.push(`a.created_at >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      conditions.push(`a.created_at <= $${params.length}`);
    }
    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const lim = parseInt(limit, 10);
    const limitClause = lim ? ` LIMIT ${lim}` : '';
    const result = await pool.query(`${query}${where} ORDER BY a.created_at DESC${limitClause}`, params);
    const parser = new Parser();
    const csv = parser.parse(result.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="activity_logs.csv"');
    res.send(csv);
    logger.info('Activity logs exported');
    exportAttemptCounter.inc();
  } catch (err) {
    logger.error('Activity logs export error:', err);
    res.status(500).json({ message: 'Failed to export logs' });
  }
};
