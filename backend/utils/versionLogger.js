const pool = require('../config/db');
// jsondiffpatch is an ES module. Use dynamic import in CommonJS.

let diff;

async function getDiff() {
  if (!diff) {
    ({ diff } = await import('jsondiffpatch'));
  }
  return diff;
}

async function recordInvoiceVersion(invoiceId, oldInvoice, newInvoice, userId, username) {
  try {
    const diffFn = await getDiff();
    const changes = diffFn(oldInvoice, newInvoice) || {};
    await pool.query(
      'INSERT INTO invoice_versions (invoice_id, editor_id, editor_name, diff, snapshot) VALUES ($1,$2,$3,$4,$5)',
      [invoiceId, userId || null, username || null, changes, newInvoice]
    );
  } catch (err) {
    console.error('Version log error:', err);
  }
}

module.exports = { recordInvoiceVersion };
