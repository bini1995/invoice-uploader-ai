const axios = require('axios');

async function exportToQuickBooks(invoice) {
  if (!process.env.QBO_URL || !process.env.QBO_TOKEN) return;
  try {
    await axios.post(`${process.env.QBO_URL}/invoices`, invoice, {
      headers: { Authorization: `Bearer ${process.env.QBO_TOKEN}` },
    });
    console.log('Exported invoice to QuickBooks');
  } catch (err) {
    console.error('QuickBooks export error:', err.message);
  }
}

async function exportToSAP(invoice) {
  if (!process.env.SAP_URL || !process.env.SAP_TOKEN) return;
  try {
    await axios.post(`${process.env.SAP_URL}/invoices`, invoice, {
      headers: { Authorization: `Bearer ${process.env.SAP_TOKEN}` },
    });
    console.log('Exported invoice to SAP');
  } catch (err) {
    console.error('SAP export error:', err.message);
  }
}

module.exports = { exportToQuickBooks, exportToSAP };
