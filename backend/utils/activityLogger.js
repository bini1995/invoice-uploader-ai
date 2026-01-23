
import pool from '../config/db.js';
import { broadcastActivity } from './chatServer.js';
import { broadcastDocActivity } from './docActivityServer.js';
import { logAudit } from './auditLogger.js';
import { requestSignature } from './docusignService.js';
async function logActivity(userId, action, invoiceId = null, username = null) {
  try {
    const { rows } = await pool.query(
      'INSERT INTO activity_logs (user_id, username, action, invoice_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [userId, username, action, invoiceId]
    );
    broadcastActivity?.(rows[0]);
    if (['upload_invoice', 'approve_invoice', 'flag_invoice'].includes(action)) {
      broadcastDocActivity?.({ action, invoiceId });
    }
    await logActivityDetailed('default', userId, username, action, { invoiceId });
    if (['upload_invoice', 'approve_invoice', 'flag_invoice', 'unflag_invoice'].includes(action)) {
      let docusign = null;
      if (action === 'approve_invoice') {
        docusign = await requestSignature({
          auditLogId: null,
          invoiceId,
          approverEmail: username ? `${username}@example.com` : null,
        });
      }
      await logAudit(action, invoiceId, userId, username, {
        docusignEnvelopeId: docusign?.envelopeId || null,
        docusignStatus: docusign?.status || null,
        docusignSignedAt: docusign?.signedAt || null,
      });
    }
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

async function logActivityDetailed(tenantId, userId, username, action, details = null) {
  try {
    await pool.query(
      'INSERT INTO activities_log (tenant_id, user_id, username, action, details) VALUES ($1,$2,$3,$4,$5)',
      [tenantId, userId, username, action, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Detailed activity log error:', err);
  }
}

export { logActivity, logActivityDetailed };
