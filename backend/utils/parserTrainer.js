const pool = require('../config/db');
let vendorCorrections = {};

async function loadCorrections() {
  try {
    const { rows } = await pool.query('SELECT field, old_value, new_value FROM ocr_corrections');
    vendorCorrections = {};
    rows.forEach(r => {
      if (r.field === 'vendor' && r.old_value && r.new_value) {
        vendorCorrections[r.old_value.toLowerCase()] = r.new_value;
      }
    });
  } catch (err) {
    console.error('Load corrections failed:', err.message);
  }
}

function applyCorrections(invoice) {
  if (!invoice) return invoice;
  const vendor = invoice.vendor && invoice.vendor.toLowerCase();
  if (vendor && vendorCorrections[vendor]) {
    invoice.vendor = vendorCorrections[vendor];
  }
  return invoice;
}

module.exports = { loadCorrections, applyCorrections };

