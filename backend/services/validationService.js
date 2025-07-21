const levenshtein = require('fast-levenshtein');
const pool = require('../config/db');

async function validateInvoiceRow(inv, rowNum) {
  const errors = [];
  if (!inv.invoice_number || !inv.date || !inv.amount || !inv.vendor) {
    errors.push(`Row ${rowNum}: Missing required field`);
  }
  if (inv.amount && isNaN(parseFloat(inv.amount))) {
    errors.push(`Row ${rowNum}: Amount is not a valid number`);
  }
  if (inv.date && isNaN(Date.parse(inv.date))) {
    errors.push(`Row ${rowNum}: Date is not valid`);
  }
  const contentHash = require('crypto')
    .createHash('sha256')
    .update(`${inv.invoice_number}|${inv.amount}|${inv.vendor}`)
    .digest('hex');
  try {
    const dupRes = await pool.query(
      'SELECT id FROM invoices WHERE content_hash = $1 LIMIT 1',
      [contentHash]
    );
    if (dupRes.rows.length) {
      errors.push(`Row ${rowNum}: Possible duplicate of invoice ID ${dupRes.rows[0].id}`);
    }
  } catch (err) {
    errors.push(`Row ${rowNum}: Duplicate check failed`);
  }
  return errors;
}

async function checkSimilarity(vendor, invoice_number, amount) {
  try {
    const { rows: recent } = await pool.query(
      'SELECT invoice_number, amount, vendor FROM invoices WHERE vendor = $1 ORDER BY id DESC LIMIT 20',
      [vendor]
    );
    const newStr = `${invoice_number}|${amount}|${vendor}`.toLowerCase();
    for (const r of recent) {
      const oldStr = `${r.invoice_number}|${r.amount}|${r.vendor}`.toLowerCase();
      const distance = levenshtein.get(newStr, oldStr);
      const similarity = 1 - distance / Math.max(newStr.length, oldStr.length);
      if (similarity > 0.8) {
        return `Possible duplicate (${Math.round(similarity * 100)}%)`;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

async function validateDocumentRow(doc, rowNum, type = 'document') {
  if (type === 'invoice') {
    return validateInvoiceRow(doc, rowNum);
  }
  const errors = [];
  if (type === 'contract') {
    if (!doc.party_name || !doc.doc_date) {
      errors.push(`Row ${rowNum}: Missing required field`);
    }
  }
  return errors;
}

module.exports = { validateInvoiceRow, checkSimilarity, validateDocumentRow };
