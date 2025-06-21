const pool = require('../config/db');
let vendorCorrections = {};
let vendorWeights = {};

async function loadCorrections() {
  try {
    const { rows } = await pool.query('SELECT field, old_value, new_value FROM ocr_corrections');
    vendorCorrections = {};
    vendorWeights = {};
    rows.forEach(r => {
      if (r.field === 'vendor' && r.old_value && r.new_value) {
        vendorCorrections[r.old_value.toLowerCase()] = r.new_value;
        const key = r.new_value.toLowerCase();
        vendorWeights[key] = (vendorWeights[key] || 0) + 1;
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

function updateWeights(field, newValue) {
  if (field === 'vendor' && newValue) {
    const key = newValue.toLowerCase();
    vendorWeights[key] = (vendorWeights[key] || 0) + 1;
  }
}

function getWeight(vendor) {
  return vendorWeights[vendor?.toLowerCase()] || 0;
}

module.exports = { loadCorrections, applyCorrections, updateWeights, getWeight };

