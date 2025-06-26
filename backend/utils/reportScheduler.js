const cron = require('node-cron');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const pool = require('../config/db');
const { sendMail } = require('./email');
const { sendSlackNotification } = require('./notify');
const { buildFilterQuery } = require('../controllers/analyticsController');

let jobs = [];

async function buildReport(filters = {}) {
  const { where, params } = buildFilterQuery(filters);
  const { rows } = await pool.query(
    `SELECT invoice_number, date, vendor, department, amount FROM invoices ${where} ORDER BY date DESC`,
    params
  );
  const doc = new PDFDocument();
  const pdfBuffers = [];
  doc.on('data', b => pdfBuffers.push(b));
  doc.fontSize(18).text('Invoice Report', { align: 'center' });
  doc.moveDown();
  rows.forEach(r => {
    doc.fontSize(12).text(`Invoice #${r.invoice_number}`);
    doc.text(`Date: ${r.date}`);
    doc.text(`Vendor: ${r.vendor}`);
    if (r.department) doc.text(`Department: ${r.department}`);
    doc.text(`Amount: $${parseFloat(r.amount).toFixed(2)}`);
    doc.moveDown();
  });
  doc.end();
  const pdf = Buffer.concat(pdfBuffers);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Report');
  sheet.columns = [
    { header: 'Invoice', key: 'invoice_number' },
    { header: 'Date', key: 'date' },
    { header: 'Vendor', key: 'vendor' },
    { header: 'Department', key: 'department' },
    { header: 'Amount', key: 'amount' },
  ];
  rows.forEach(r => sheet.addRow(r));
  const excel = await workbook.xlsx.writeBuffer();
  return { pdf, excel };
}

async function sendDailyReport() {
  try {
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { pdf, excel } = await buildReport({ startDate: start.toISOString() });
    const { rows: flagged } = await pool.query(
      "SELECT COUNT(*) AS cnt FROM invoices WHERE flagged = TRUE AND created_at >= NOW() - INTERVAL '1 day'"
    );
    const { rows: uploaded } = await pool.query(
      "SELECT COUNT(*) AS cnt FROM invoices WHERE created_at >= NOW() - INTERVAL '1 day'"
    );
    const summary = `Daily digest: ${uploaded[0].cnt} invoices uploaded, ${flagged[0].cnt} flagged.`;
    await sendMail({
      to: process.env.EMAIL_TO,
      subject: 'Daily Invoice Report',
      text: summary,
      attachments: [
        { filename: 'report.pdf', content: pdf },
        { filename: 'report.xlsx', content: excel },
      ],
    });
    await sendSlackNotification?.(summary);
  } catch (err) {
    console.error('Report email error:', err);
  }
}

function scheduleReports() {
  cron.schedule('0 8 * * *', sendDailyReport);
  loadReportSchedules();
}

async function sendScheduledReport(s) {
  try {
    const { pdf, excel } = await buildReport({
      vendor: s.vendor,
      department: s.department,
      startDate: s.start_date ? s.start_date.toISOString?.() || s.start_date : null,
      endDate: s.end_date ? s.end_date.toISOString?.() || s.end_date : null,
    });
    await sendMail({
      to: s.email,
      subject: 'Scheduled Invoice Report',
      text: 'Your requested report is attached.',
      attachments: [
        { filename: 'report.pdf', content: pdf },
        { filename: 'report.xlsx', content: excel },
      ],
    });
    await pool.query('UPDATE report_schedules SET last_run = NOW() WHERE id = $1', [s.id]);
  } catch (err) {
    console.error('Scheduled report error:', err);
  }
}

async function loadReportSchedules() {
  try {
    const { rows } = await pool.query('SELECT * FROM report_schedules WHERE active = TRUE');
    jobs.forEach(j => j.stop());
    jobs = [];
    for (const s of rows) {
      try {
        const job = cron.schedule(s.cron || '0 8 * * *', () => sendScheduledReport(s).catch(() => {}));
        jobs.push(job);
      } catch (err) {
        console.error('Report schedule cron error:', err.message);
      }
    }
  } catch (err) {
    console.error('Load report schedules error:', err);
  }
}

module.exports = { scheduleReports, loadReportSchedules };
