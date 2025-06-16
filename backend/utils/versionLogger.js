const pool = require('../config/db');
const { diff } = require('jsondiffpatch');

async function recordInvoiceVersion(invoiceId, oldInvoice, newInvoice, userId, username) {
  try {
    const changes = diff(oldInvoice, newInvoice) || {};
    await pool.query(
      'INSERT INTO invoice_versions (invoice_id, editor_id, editor_name, diff, snapshot) VALUES ($1,$2,$3,$4,$5)',
      [invoiceId, userId || null, username || null, changes, newInvoice]
    );
  } catch (err) {
    console.error('Version log error:', err);
  }
}

module.exports = { recordInvoiceVersion };
