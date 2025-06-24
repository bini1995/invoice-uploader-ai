const cron = require('node-cron');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const pool = require('../config/db');
const { sendMail } = require('./email');

async function buildReport() {
  const { rows } = await pool.query(
    "SELECT invoice_number, date, vendor, amount FROM invoices WHERE date >= NOW() - INTERVAL '1 day' ORDER BY date DESC"
  );
  const doc = new PDFDocument();
  const pdfBuffers = [];
  doc.on('data', b => pdfBuffers.push(b));
  doc.fontSize(18).text('Daily Invoice Report', { align: 'center' });
  doc.moveDown();
  rows.forEach(r => {
    doc.fontSize(12).text(`Invoice #${r.invoice_number}`);
    doc.text(`Date: ${r.date}`);
    doc.text(`Vendor: ${r.vendor}`);
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
    { header: 'Amount', key: 'amount' },
  ];
  rows.forEach(r => sheet.addRow(r));
  const excel = await workbook.xlsx.writeBuffer();
  return { pdf, excel };
}

async function sendDailyReport() {
  try {
    const { pdf, excel } = await buildReport();
    await sendMail({
      to: process.env.EMAIL_TO,
      subject: 'Daily Invoice Report',
      text: 'Attached is the latest invoice report.',
      attachments: [
        { filename: 'report.pdf', content: pdf },
        { filename: 'report.xlsx', content: excel },
      ],
    });
  } catch (err) {
    console.error('Report email error:', err);
  }
}

function scheduleReports() {
  cron.schedule('0 8 * * *', sendDailyReport);
}

module.exports = { scheduleReports };
