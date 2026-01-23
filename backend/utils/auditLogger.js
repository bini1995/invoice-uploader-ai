import pool from '../config/db.js';
import {
  computeAuditHash,
  storeHashOnChain,
} from './blockchainAudit.js';

async function logAudit(action, invoiceId, userId, username, metadata = {}) {
  try {
    const result = await pool.query(
      `INSERT INTO audit_logs (
        action,
        invoice_id,
        user_id,
        username,
        docusign_envelope_id,
        docusign_status,
        docusign_signed_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        action,
        invoiceId,
        userId,
        username,
        metadata.docusignEnvelopeId || null,
        metadata.docusignStatus || null,
        metadata.docusignSignedAt || null,
      ]
    );

    const entry = result.rows[0];
    const integrityHash = computeAuditHash({
      action: entry.action,
      invoice_id: entry.invoice_id,
      user_id: entry.user_id,
      username: entry.username,
      created_at: entry.created_at,
      docusign_envelope_id: entry.docusign_envelope_id,
      docusign_status: entry.docusign_status,
      docusign_signed_at: entry.docusign_signed_at,
    });

    const chainResult = await storeHashOnChain(integrityHash).catch((err) => {
      console.error('Blockchain audit store error:', err.message);
      return { txHash: null, network: null, skipped: true };
    });

    await pool.query(
      `UPDATE audit_logs
       SET integrity_hash = $1,
           blockchain_tx = $2,
           blockchain_network = $3
       WHERE id = $4`,
      [
        integrityHash,
        chainResult.txHash,
        chainResult.network,
        entry.id,
      ]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

export { logAudit };
