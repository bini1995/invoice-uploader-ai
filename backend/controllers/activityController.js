const pool = require('../config/db');
const { Parser } = require('json2csv');
const archiver = require('archiver');

exports.getActivityLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC');
    res.json(result.rows);
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
    res.json(result.rows);
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
  } catch (err) {
    console.error('Compliance export error:', err);
    res.status(500).json({ message: 'Failed to export compliance report' });
  }
};
