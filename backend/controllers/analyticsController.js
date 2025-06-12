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
