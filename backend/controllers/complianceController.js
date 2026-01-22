import pool from '../config/db.js';
import {
  anonymizeObject,
  anonymizeText,
  recordConsentLog,
  recordAnonymizationLog,
} from '../utils/compliance.js';
import logger from '../utils/logger.js';

const normalizeSubjectType = (subjectType) => {
  const normalized = String(subjectType || '').toLowerCase();
  if (normalized === 'documents') return 'document';
  if (normalized === 'invoices') return 'invoice';
  return normalized;
};

export const recordConsent = async (req, res) => {
  try {
    const {
      subject_type,
      subject_id,
      consent_type,
      consent_granted = true,
      source,
      policy_version,
      metadata,
    } = req.body || {};

    if (!subject_type || !consent_type) {
      return res.status(400).json({ message: 'subject_type and consent_type are required' });
    }

    await recordConsentLog({
      tenantId: req.tenantId,
      subjectType: normalizeSubjectType(subject_type),
      subjectId: subject_id || null,
      consentType: consent_type,
      consentGranted: Boolean(consent_granted),
      source: source || 'api',
      policyVersion: policy_version || null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || null,
      metadata: metadata || {},
    });

    res.status(201).json({ status: 'recorded' });
  } catch (err) {
    logger.error('Consent log error', err);
    res.status(500).json({ message: 'Failed to record consent' });
  }
};

export const listConsentLogs = async (req, res) => {
  try {
    const { subject_type, subject_id, limit = 100 } = req.query;
    const filters = ['tenant_id = $1'];
    const params = [req.tenantId];

    if (subject_type) {
      params.push(normalizeSubjectType(subject_type));
      filters.push(`subject_type = $${params.length}`);
    }

    if (subject_id) {
      params.push(subject_id);
      filters.push(`subject_id = $${params.length}`);
    }

    const lim = Math.min(parseInt(limit, 10) || 100, 500);
    const { rows } = await pool.query(
      `SELECT * FROM consent_logs WHERE ${filters.join(' AND ')} ORDER BY created_at DESC LIMIT ${lim}`,
      params
    );
    res.json(rows);
  } catch (err) {
    logger.error('Consent log fetch error', err);
    res.status(500).json({ message: 'Failed to fetch consent logs' });
  }
};

export const anonymizeRecord = async (req, res) => {
  try {
    const { subject_type, subject_id, reason } = req.body || {};
    const normalizedType = normalizeSubjectType(subject_type);

    if (!normalizedType || !subject_id) {
      return res.status(400).json({ message: 'subject_type and subject_id are required' });
    }

    const now = new Date();
    if (normalizedType === 'document') {
      const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1 AND tenant_id = $2', [
        subject_id,
        req.tenantId,
      ]);
      if (!rows.length) return res.status(404).json({ message: 'Document not found' });
      const doc = rows[0];
      const anonymizedText = anonymizeText(doc.raw_text || '');
      const anonymizedMetadata = anonymizeObject(doc.metadata || {});
      const anonymizedFields = anonymizeObject(doc.fields || {});

      await pool.query(
        `UPDATE documents
         SET raw_text = $1,
             metadata = $2,
             fields = $3,
             anonymized_at = $4,
             contains_phi = FALSE,
             phi_fields = $5,
             phi_encrypted_payload = NULL
         WHERE id = $6 AND tenant_id = $7`,
        [anonymizedText, anonymizedMetadata, anonymizedFields, now, JSON.stringify([]), subject_id, req.tenantId]
      );
    } else if (normalizedType === 'invoice') {
      const { rows } = await pool.query('SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2', [
        subject_id,
        req.tenantId,
      ]);
      if (!rows.length) return res.status(404).json({ message: 'Invoice not found' });
      const invoice = rows[0];
      const anonymizedNotes = anonymizeText(invoice.private_notes || '');
      const anonymizedComments = Array.isArray(invoice.comments)
        ? invoice.comments.map((comment) => anonymizeObject(comment))
        : anonymizeObject(invoice.comments || []);

      await pool.query(
        `UPDATE invoices
         SET private_notes = $1,
             comments = $2,
             anonymized_at = $3,
             contains_phi = FALSE,
             phi_fields = $4,
             phi_encrypted_payload = NULL
         WHERE id = $5 AND tenant_id = $6`,
        [anonymizedNotes, anonymizedComments, now, JSON.stringify([]), subject_id, req.tenantId]
      );
    } else {
      return res.status(400).json({ message: 'Unsupported subject_type' });
    }

    await recordAnonymizationLog({
      tenantId: req.tenantId,
      subjectType: normalizedType,
      subjectId: subject_id,
      requestedBy: req.user?.userId || null,
      reason: reason || null,
      status: 'completed',
    });

    res.json({ status: 'anonymized' });
  } catch (err) {
    logger.error('Anonymization error', err);
    res.status(500).json({ message: 'Failed to anonymize record' });
  }
};
