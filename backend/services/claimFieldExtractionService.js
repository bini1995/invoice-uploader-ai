import fs from 'fs';
import pool from '../config/db.js';
import { extractClaimFields as aiExtractClaimFields } from '../ai/claimFieldExtractor.js';
import { extractDuration } from '../metrics.js';
import logger from '../utils/logger.js';

export async function processClaimFieldExtraction({ documentId }) {
  const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [documentId]);
  if (!rows.length) {
    throw new Error('Document not found');
  }

  const doc = rows[0];
  const timer = extractDuration.startTimer({ doc_type: doc.doc_type });
  try {
    const text = doc.raw_text || fs.readFileSync(doc.path, 'utf8').slice(0, 10000);
    const { fields, confidenceScores, overallConfidence, version } = await aiExtractClaimFields(text);
    await pool.query(
      `INSERT INTO claim_fields (document_id, fields, version, confidence_scores, overall_confidence, extracted_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (document_id) DO UPDATE SET
         fields = EXCLUDED.fields,
         version = EXCLUDED.version,
         confidence_scores = EXCLUDED.confidence_scores,
         overall_confidence = EXCLUDED.overall_confidence,
         extracted_at = EXCLUDED.extracted_at`,
      [documentId, fields, version, confidenceScores || {}, overallConfidence || 0.9]
    );
    logger.info('Claim fields extracted', { id: documentId, overallConfidence });
    return { fields, confidenceScores, overallConfidence, version };
  } catch (err) {
    logger.error('Claim field extract error:', err);
    throw err;
  } finally {
    if (typeof timer === 'function') timer();
  }
}
