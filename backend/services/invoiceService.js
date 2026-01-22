import pool from '../config/db.js';
import { recordInvoiceVersion } from '../utils/versionLogger.js';
import { triggerAutomations } from '../utils/automationEngine.js';
import logger from '../utils/logger.js';
import { buildPhiPayload, encryptPhiPayload, anonymizeObject } from '../utils/compliance.js';
import {
  getAssigneeFromVendorHistory,
  getAssigneeFromTags,
  getAssigneeFromVendorProfile,
} from '../utils/assignment.js';

async function autoAssignInvoice(invoiceId, vendor, tags = []) {
  let assignee;
  try {
    let reason = null;
    const hist = await pool.query(
      `SELECT assignee, COUNT(*) AS cnt FROM invoices WHERE LOWER(vendor)=LOWER($1) AND assignee IS NOT NULL GROUP BY assignee ORDER BY cnt DESC LIMIT 1`,
      [vendor]
    );
    if (hist.rows[0]) {
      assignee = hist.rows[0].assignee;
      const cnt = parseInt(hist.rows[0].cnt, 10);
      reason = `Based on prior ${cnt} uploads from vendor ${vendor}`;
    }
    if (!assignee) {
      assignee = getAssigneeFromTags(tags);
      if (assignee) reason = 'Matched tags';
    }
    if (!assignee) {
      assignee = await getAssigneeFromVendorProfile(vendor);
      if (assignee) reason = 'Matched vendor profile';
    }
    if (!assignee && vendor && vendor.toLowerCase().includes('figma')) {
      assignee = 'Design Team';
      reason = 'Default Figma rule';
    }
    if (!assignee && tags.map(t => t.toLowerCase()).includes('marketing')) {
      assignee = 'Alice';
      reason = 'Default marketing rule';
    }
    if (assignee) {
      await pool.query('UPDATE invoices SET assignee = $1 WHERE id = $2', [assignee, invoiceId]);
    }
    return { assignee, reason };
  } catch (err) {
    logger.error({ err }, 'Auto-assign error');
    return { assignee: null, reason: null };
  }
}

async function autoAssignDocument(docId, vendor, tags = []) {
  let assignee;
  let reason = null;
  try {
    const res = await pool.query(
      `SELECT assignee, COUNT(*) AS cnt FROM documents WHERE LOWER(party_name)=LOWER($1) AND assignee IS NOT NULL GROUP BY assignee ORDER BY cnt DESC LIMIT 1`,
      [vendor]
    );
    if (res.rows[0]) {
      assignee = res.rows[0].assignee;
      const cnt = parseInt(res.rows[0].cnt, 10);
      reason = `Based on prior ${cnt} uploads from vendor ${vendor}`;
    }
    if (!assignee) {
      assignee = getAssigneeFromTags(tags);
      if (assignee) reason = 'Matched tags';
    }
    if (!assignee) {
      assignee = await getAssigneeFromVendorProfile(vendor);
      if (assignee) reason = 'Matched vendor profile';
    }
    if (assignee) {
      await pool.query('UPDATE documents SET assignee = $1, assignment_reason = $2 WHERE id = $3', [assignee, reason, docId]);
    }
    return { assignee, reason };
  } catch (err) {
    logger.error({ err }, 'Auto-assign document error');
    return { assignee: null, reason: null };
  }
}

async function insertInvoice(inv, tenantId) {
  const {
    invoice_number, date, amount, vendor, party_name, tags = [], category = null,
    assignee = null, flagged = false, flag_reason, approval_chain = ['Manager','Finance','CFO'], current_step = 0,
    integrity_hash, content_hash, blockchain_tx = null, retention_policy, delete_at = null,
    approval_status = 'Pending', department = null, original_amount, currency,
    exchange_rate, vat_percent, vat_amount, expires_at = null, encrypted_payload = null,
    private_notes = null, comments = null,
    phi_data = null
  } = inv;
  const finalParty = party_name || vendor;
  const phiSource = phi_data || { private_notes, comments };
  const { fields: phiFields, payload: phiPayload } = buildPhiPayload({
    text: '',
    metadata: phiSource || {},
    fields: {},
  });
  const containsPhi = phiFields.length > 0;
  const phiEncryptedPayload = containsPhi ? encryptPhiPayload(phiPayload) : null;
  const anonymizedMeta = containsPhi ? anonymizeObject(phiSource) : phiSource;
  const res = await pool.query(
    `INSERT INTO invoices (invoice_number, date, amount, vendor, party_name, tags, category, assignee, flagged, flag_reason, approval_chain, current_step, integrity_hash, content_hash, blockchain_tx, retention_policy, delete_at, tenant_id, approval_status, department, original_amount, currency, exchange_rate, vat_percent, vat_amount, expires_at, expired, encrypted_payload, contains_phi, phi_fields, phi_encrypted_payload, anonymized_at, private_notes, comments)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35) RETURNING id`,
    [
      invoice_number,
      date,
      amount,
      vendor,
      finalParty,
      tags,
      category,
      assignee,
      flagged,
      flag_reason,
      JSON.stringify(approval_chain),
      current_step,
      integrity_hash,
      content_hash,
      blockchain_tx,
      retention_policy,
      delete_at,
      tenantId,
      approval_status,
      department,
      original_amount,
      currency,
      exchange_rate,
      vat_percent,
      vat_amount,
      expires_at,
      false,
      encrypted_payload,
      containsPhi,
      JSON.stringify(phiFields),
      phiEncryptedPayload,
      containsPhi ? new Date() : null,
      anonymizedMeta?.private_notes || private_notes || null,
      anonymizedMeta?.comments || comments || null,
    ]
  );
  const newId = res.rows[0].id;
  const afterRes = await pool.query('SELECT * FROM invoices WHERE id = $1', [newId]);
  if (afterRes.rows.length) {
    await recordInvoiceVersion(newId, {}, afterRes.rows[0], inv.editor_id, inv.editor_name);
  }
  triggerAutomations('invoice_created', { invoice: afterRes.rows[0] });
  return newId;
}

export { autoAssignInvoice, insertInvoice, autoAssignDocument };
