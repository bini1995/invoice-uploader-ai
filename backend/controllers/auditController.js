
import pool from '../config/db.js';
import { verifyHashOnChain, computeAuditHash } from '../utils/blockchainAudit.js';
import { verifyEnvelopeStatus } from '../utils/docusignService.js';

const buildAuditVerification = async (entry) => {
  const recomputedHash = computeAuditHash({
    action: entry.action,
    invoice_id: entry.invoice_id,
    user_id: entry.user_id,
    username: entry.username,
    created_at: entry.created_at,
    docusign_envelope_id: entry.docusign_envelope_id,
    docusign_status: entry.docusign_status,
    docusign_signed_at: entry.docusign_signed_at,
  });
  const chainStatus = await verifyHashOnChain(recomputedHash, entry.blockchain_tx);
  const docusignStatus = await verifyEnvelopeStatus({
    envelopeId: entry.docusign_envelope_id,
  });
  return {
    ...entry,
    integrity_verification: {
      stored: entry.integrity_hash,
      recomputed: recomputedHash,
      match: entry.integrity_hash ? entry.integrity_hash === recomputedHash : null,
    },
    blockchain_verification: chainStatus,
    docusign_verification: docusignStatus,
  };
};
export const getAuditTrail = async (req, res) => {
  try {
    const { invoiceId } = req.query;
    let result;
    if (invoiceId) {
      result = await pool.query(
        'SELECT * FROM audit_logs WHERE invoice_id = $1 ORDER BY created_at',
        [invoiceId]
      );
    } else {
      result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC');
    }
    const rows = await Promise.all(result.rows.map(buildAuditVerification));
    res.json(rows);
  } catch (err) {
    console.error('Audit fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

export const getClaimAuditTrail = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs WHERE invoice_id = $1 ORDER BY created_at',
      [id]
    );
    const rows = await Promise.all(result.rows.map(buildAuditVerification));
    res.json(rows);
  } catch (err) {
    console.error('Audit claim fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch claim audit logs' });
  }
};

export const updateAuditEntry = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  try {
    const result = await pool.query(
      'UPDATE audit_logs SET action = $1 WHERE id = $2 RETURNING *',
      [action, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Audit entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Audit update error:', err);
    res.status(500).json({ message: 'Failed to update audit entry' });
  }
};

export const deleteAuditEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM audit_logs WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Audit entry not found' });
    }
    res.json({ message: 'Audit entry deleted' });
  } catch (err) {
    console.error('Audit delete error:', err);
    res.status(500).json({ message: 'Failed to delete audit entry' });
  }
};
