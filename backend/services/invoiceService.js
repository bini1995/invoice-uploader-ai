const pool = require('../config/db');
const { recordInvoiceVersion } = require('../utils/versionLogger');
const { triggerAutomations } = require('../utils/automationEngine');
const logger = require('../utils/logger');

async function autoAssignInvoice(invoiceId, vendor, tags = []) {
  let assignee;
  try {
    const { getAssigneeFromVendorHistory, getAssigneeFromTags } = require('../utils/assignment');
    assignee = await getAssigneeFromVendorHistory(vendor);
    if (!assignee) assignee = getAssigneeFromTags(tags);
    if (!assignee && vendor && vendor.toLowerCase().includes('figma')) assignee = 'Design Team';
    if (!assignee && tags.map(t => t.toLowerCase()).includes('marketing')) assignee = 'Alice';
    if (assignee) {
      await pool.query('UPDATE invoices SET assignee = $1 WHERE id = $2', [assignee, invoiceId]);
    }
  } catch (err) {
    logger.error({ err }, 'Auto-assign error');
  }
}

async function insertInvoice(inv, tenantId) {
  const {
    invoice_number, date, amount, vendor, tags = [], category = null,
    assignee = null, flagged = false, flag_reason, approval_chain = ['Manager','Finance','CFO'], current_step = 0,
    integrity_hash, content_hash, blockchain_tx = null, retention_policy, delete_at = null,
    approval_status = 'Pending', department = null, original_amount, currency,
    exchange_rate, vat_percent, vat_amount, expires_at = null, encrypted_payload = null
  } = inv;
  const res = await pool.query(
    `INSERT INTO invoices (invoice_number, date, amount, vendor, tags, category, assignee, flagged, flag_reason, approval_chain, current_step, integrity_hash, content_hash, blockchain_tx, retention_policy, delete_at, tenant_id, approval_status, department, original_amount, currency, exchange_rate, vat_percent, vat_amount, expires_at, expired, encrypted_payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28) RETURNING id`,
    [invoice_number, date, amount, vendor, tags, category, assignee, flagged, flag_reason, JSON.stringify(approval_chain), current_step, integrity_hash, content_hash, blockchain_tx, retention_policy, delete_at, tenantId, approval_status, department, original_amount, currency, exchange_rate, vat_percent, vat_amount, expires_at, false, encrypted_payload]
  );
  const newId = res.rows[0].id;
  const afterRes = await pool.query('SELECT * FROM invoices WHERE id = $1', [newId]);
  if (afterRes.rows.length) {
    await recordInvoiceVersion(newId, {}, afterRes.rows[0], inv.editor_id, inv.editor_name);
  }
  triggerAutomations('invoice_created', { invoice: afterRes.rows[0] });
  return newId;
}

module.exports = { autoAssignInvoice, insertInvoice };
