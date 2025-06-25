const axios = require('axios');

async function exportToErpA(invoice) {
  if (!process.env.ERP_A_URL || !process.env.ERP_A_TOKEN) return;
  try {
    await axios.post(`${process.env.ERP_A_URL}/invoices`, invoice, {
      headers: { Authorization: `Bearer ${process.env.ERP_A_TOKEN}` },
    });
    console.log('Exported invoice to ERP A');
  } catch (err) {
    console.error('ERP A export error:', err.message);
  }
}

async function exportToErpB(invoice) {
  if (!process.env.ERP_B_URL || !process.env.ERP_B_TOKEN) return;
  try {
    await axios.post(`${process.env.ERP_B_URL}/invoices`, invoice, {
      headers: { Authorization: `Bearer ${process.env.ERP_B_TOKEN}` },
    });
    console.log('Exported invoice to ERP B');
  } catch (err) {
    console.error('ERP B export error:', err.message);
  }
}

module.exports = { exportToErpA, exportToErpB };
