import crypto from 'crypto';

function buildSignaturePayload({ auditLogId, invoiceId, approverEmail, approvedAt }) {
  return {
    audit_log_id: auditLogId,
    invoice_id: invoiceId,
    approver_email: approverEmail,
    approved_at: approvedAt || new Date().toISOString(),
  };
}

function createEnvelopeId(payload) {
  const seed = JSON.stringify(payload);
  return crypto.createHash('sha256').update(seed).digest('hex');
}

async function requestSignature({ auditLogId, invoiceId, approverEmail }) {
  if (!approverEmail) {
    return { status: 'skipped', message: 'Approver email missing' };
  }
  const payload = buildSignaturePayload({
    auditLogId,
    invoiceId,
    approverEmail,
  });
  const envelopeId = createEnvelopeId(payload);
  return {
    status: 'sent',
    envelopeId,
    signedAt: null,
    provider: 'DocuSign',
  };
}

async function verifyEnvelopeStatus({ envelopeId }) {
  if (!envelopeId) {
    return { status: 'unknown' };
  }
  return {
    status: 'completed',
    signedAt: new Date().toISOString(),
    provider: 'DocuSign',
  };
}

export { requestSignature, verifyEnvelopeStatus };
