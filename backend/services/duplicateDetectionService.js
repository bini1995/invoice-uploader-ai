import pool from '../config/db.js';
import logger from '../utils/logger.js';

function normalizeString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function normalizeAmount(amount) {
  if (!amount) return '';
  return amount.toString().replace(/[^0-9.]/g, '');
}

function normalizeDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return normalizeString(dateStr);
    return d.toISOString().split('T')[0];
  } catch {
    return normalizeString(dateStr);
  }
}

function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  const na = normalizeString(a);
  const nb = normalizeString(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1.0;

  const longer = na.length > nb.length ? na : nb;
  const shorter = na.length > nb.length ? nb : na;
  if (longer.length === 0) return 1.0;

  const editDist = levenshteinDistance(na, nb);
  return 1.0 - editDist / longer.length;
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function computeSimilarityScore(fieldsA, fieldsB) {
  const weights = {
    claimant_name: 30,
    date_of_incident: 20,
    total_claimed_amount: 25,
    policy_number: 25
  };

  const matchedFields = {};
  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const valA = fieldsA[key];
    const valB = fieldsB[key];

    if (!valA && !valB) continue;
    totalWeight += weight;

    let similarity = 0;
    if (key === 'total_claimed_amount') {
      const normA = normalizeAmount(valA);
      const normB = normalizeAmount(valB);
      similarity = normA && normB && normA === normB ? 1.0 : 0;
    } else if (key === 'date_of_incident') {
      const normA = normalizeDate(valA);
      const normB = normalizeDate(valB);
      similarity = normA && normB && normA === normB ? 1.0 : stringSimilarity(valA, valB);
    } else {
      similarity = stringSimilarity(valA, valB);
    }

    if (similarity > 0.6) {
      matchedFields[key] = {
        this_value: valA || '',
        match_value: valB || '',
        similarity: parseFloat((similarity * 100).toFixed(1))
      };
    }

    totalScore += similarity * weight;
  }

  const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  return {
    score: parseFloat((overallScore * 100).toFixed(1)),
    matchedFields
  };
}

function parseFieldsJson(fields) {
  if (!fields) return {};
  if (typeof fields === 'string') {
    try {
      const parsed = JSON.parse(fields);
      if (parsed && parsed.raw) {
        try {
          const cleaned = parsed.raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          return JSON.parse(cleaned);
        } catch { return parsed; }
      }
      return parsed;
    } catch { return {}; }
  }
  if (fields && fields.raw) {
    try {
      const cleaned = fields.raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch { return fields; }
  }
  return fields;
}

export async function checkDuplicates(documentId, tenantId, extractedFields) {
  try {
    const fields = parseFieldsJson(extractedFields);
    if (!fields.claimant_name && !fields.total_claimed_amount && !fields.policy_number) {
      return [];
    }

    const { rows: existingClaims } = await pool.query(
      `SELECT cf.document_id, cf.fields, d.file_name, d.created_at, d.doc_type
       FROM claim_fields cf
       JOIN documents d ON d.id = cf.document_id
       WHERE d.tenant_id = $1 AND cf.document_id != $2
       ORDER BY cf.extracted_at DESC
       LIMIT 500`,
      [tenantId, documentId]
    );

    const duplicates = [];

    for (const existing of existingClaims) {
      const existingFields = parseFieldsJson(existing.fields);
      const { score, matchedFields } = computeSimilarityScore(fields, existingFields);

      if (score >= 60 && Object.keys(matchedFields).length >= 2) {
        duplicates.push({
          matchedDocumentId: existing.document_id,
          fileName: existing.file_name,
          createdAt: existing.created_at,
          docType: existing.doc_type,
          similarityScore: score,
          matchedFields
        });
      }
    }

    duplicates.sort((a, b) => b.similarityScore - a.similarityScore);
    const topDuplicates = duplicates.slice(0, 10);

    for (const dup of topDuplicates) {
      await pool.query(
        `INSERT INTO duplicate_flags (document_id, matched_document_id, tenant_id, similarity_score, matched_fields, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', now())
         ON CONFLICT (document_id, matched_document_id) DO UPDATE SET
           similarity_score = EXCLUDED.similarity_score,
           matched_fields = EXCLUDED.matched_fields,
           status = 'pending',
           created_at = now()`,
        [documentId, dup.matchedDocumentId, tenantId, dup.similarityScore, dup.matchedFields]
      );
    }

    if (topDuplicates.length > 0) {
      logger.info('Duplicate claims detected', {
        documentId,
        duplicateCount: topDuplicates.length,
        highestScore: topDuplicates[0]?.similarityScore
      });
    }

    return topDuplicates;
  } catch (err) {
    logger.error('Duplicate detection error:', err);
    return [];
  }
}

export async function getDuplicatesForDocument(documentId) {
  try {
    const { rows } = await pool.query(
      `SELECT df.*, d.file_name as matched_file_name, d.doc_type as matched_doc_type, d.created_at as matched_created_at
       FROM duplicate_flags df
       JOIN documents d ON d.id = df.matched_document_id
       WHERE df.document_id = $1
       ORDER BY df.similarity_score DESC`,
      [documentId]
    );
    return rows;
  } catch (err) {
    logger.error('Get duplicates error:', err);
    return [];
  }
}

export async function resolveDuplicate(flagId, userId, status) {
  try {
    await pool.query(
      `UPDATE duplicate_flags SET status = $1, resolved_by = $2, resolved_at = now() WHERE id = $3`,
      [status, userId, flagId]
    );
    return true;
  } catch (err) {
    logger.error('Resolve duplicate error:', err);
    return false;
  }
}

export async function getDuplicateStats(tenantId) {
  try {
    const { rows } = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
         COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
         COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_count,
         COUNT(*) as total_count
       FROM duplicate_flags
       WHERE tenant_id = $1`,
      [tenantId]
    );
    return rows[0] || { pending_count: 0, confirmed_count: 0, dismissed_count: 0, total_count: 0 };
  } catch (err) {
    logger.error('Duplicate stats error:', err);
    return { pending_count: 0, confirmed_count: 0, dismissed_count: 0, total_count: 0 };
  }
}
