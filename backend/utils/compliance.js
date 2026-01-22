import pool from '../config/db.js';
import { encryptSensitive } from './encryption.js';

const PHI_KEYWORDS = [
  'patient',
  'member',
  'subscriber',
  'policy',
  'claim',
  'diagnosis',
  'dob',
  'date_of_birth',
  'birth',
  'ssn',
  'social',
  'medical_record',
  'mrn',
  'insurance',
  'provider',
  'treatment',
  'procedure',
  'icd',
  'address',
  'email',
  'phone',
];

const PHI_TEXT_PATTERNS = [
  { label: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { label: 'email', regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { label: 'phone', regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
  { label: 'mrn', regex: /\b(?:MRN|Medical Record)\s*(?:#|ID)?\s*[:\-]?\s*[A-Z0-9\-]{6,}\b/gi },
  { label: 'member_id', regex: /\b(?:Member|Subscriber)\s*(?:ID|Number)?\s*[:\-]?\s*[A-Z0-9\-]{6,}\b/gi },
  { label: 'policy_id', regex: /\bPolicy\s*(?:ID|Number)?\s*[:\-]?\s*[A-Z0-9\-]{6,}\b/gi },
  { label: 'claim_id', regex: /\bClaim\s*(?:ID|Number)?\s*[:\-]?\s*[A-Z0-9\-]{6,}\b/gi },
  { label: 'dob', regex: /\b(?:DOB|Date of Birth)\s*[:\-]?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi },
  { label: 'patient_name', regex: /\bPatient\s*Name\s*[:\-]?\s*[^\n,]+/gi },
];

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const normalizeKey = (key) => String(key).toLowerCase();

const containsPhiKeyword = (key) => {
  const normalized = normalizeKey(key);
  return PHI_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

function detectPhiInText(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = new Set();
  for (const pattern of PHI_TEXT_PATTERNS) {
    if (pattern.regex.test(text)) {
      matches.add(pattern.label);
    }
    pattern.regex.lastIndex = 0;
  }
  return Array.from(matches);
}

function detectPhiInObject(payload) {
  if (!isObject(payload)) {
    return { fields: [], payload: {} };
  }

  const fields = new Set();
  const phiPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (containsPhiKeyword(key)) {
      fields.add(key);
      phiPayload[key] = value;
    }

    if (typeof value === 'string') {
      detectPhiInText(value).forEach((label) => fields.add(label));
    } else if (isObject(value)) {
      const nested = detectPhiInObject(value);
      nested.fields.forEach((field) => fields.add(field));
      if (Object.keys(nested.payload).length) {
        phiPayload[key] = nested.payload;
      }
    }
  }

  return { fields: Array.from(fields), payload: phiPayload };
}

function anonymizeText(text) {
  if (!text || typeof text !== 'string') return text;
  let output = text;
  output = output.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED]');
  output = output.replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED]');
  output = output.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED]');
  output = output.replace(/\b(?:MRN|Medical Record)\s*(?:#|ID)?\s*[:\-]?\s*[A-Z0-9\-]{6,}\b/gi, '[REDACTED]');
  output = output.replace(/\b(?:Member|Subscriber)\s*(?:ID|Number)?\s*[:\-]?\s*[A-Z0-9\-]{6,}\b/gi, '[REDACTED]');
  output = output.replace(/\bPolicy\s*(?:ID|Number)?\s*[:\-]?\s*[A-Z0-9\-]{6,}\b/gi, '[REDACTED]');
  output = output.replace(/\bClaim\s*(?:ID|Number)?\s*[:\-]?\s*[A-Z0-9\-]{6,}\b/gi, '[REDACTED]');
  output = output.replace(/\b(?:DOB|Date of Birth)\s*[:\-]?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi, '[REDACTED]');
  output = output.replace(/\bPatient\s*Name\s*[:\-]?\s*[^\n,]+/gi, 'Patient Name: [REDACTED]');
  return output;
}

function anonymizeObject(payload) {
  if (!isObject(payload)) return payload;
  const anonymized = Array.isArray(payload) ? [] : {};
  for (const [key, value] of Object.entries(payload)) {
    if (containsPhiKeyword(key)) {
      anonymized[key] = '[REDACTED]';
      continue;
    }
    if (typeof value === 'string') {
      anonymized[key] = detectPhiInText(value).length ? '[REDACTED]' : anonymizeText(value);
      continue;
    }
    if (isObject(value)) {
      anonymized[key] = anonymizeObject(value);
      continue;
    }
    anonymized[key] = value;
  }
  return anonymized;
}

function buildPhiPayload({ text, metadata = {}, fields = {} }) {
  const textFindings = detectPhiInText(text);
  const metadataFindings = detectPhiInObject(metadata);
  const fieldFindings = detectPhiInObject(fields);
  const allFields = new Set([
    ...textFindings,
    ...metadataFindings.fields,
    ...fieldFindings.fields,
  ]);
  const payload = {
    text,
    metadata: metadataFindings.payload,
    fields: fieldFindings.payload,
  };
  return { fields: Array.from(allFields), payload };
}

function encryptPhiPayload(payload) {
  if (!payload || Object.keys(payload).length === 0) return null;
  return encryptSensitive(JSON.stringify(payload));
}

async function recordConsentLog({
  tenantId,
  subjectType,
  subjectId,
  consentType,
  consentGranted,
  source,
  policyVersion,
  ipAddress,
  userAgent,
  metadata,
}) {
  await pool.query(
    `INSERT INTO consent_logs
     (tenant_id, subject_type, subject_id, consent_type, consent_granted, source, policy_version, ip_address, user_agent, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      tenantId,
      subjectType,
      subjectId,
      consentType,
      consentGranted,
      source,
      policyVersion,
      ipAddress,
      userAgent,
      metadata || {},
    ]
  );
}

async function recordAnonymizationLog({ tenantId, subjectType, subjectId, requestedBy, reason, status }) {
  await pool.query(
    `INSERT INTO anonymization_logs
     (tenant_id, subject_type, subject_id, requested_by, reason, status)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [tenantId, subjectType, subjectId, requestedBy, reason, status || 'completed']
  );
}

export {
  detectPhiInText,
  detectPhiInObject,
  anonymizeText,
  anonymizeObject,
  buildPhiPayload,
  encryptPhiPayload,
  recordConsentLog,
  recordAnonymizationLog,
};
