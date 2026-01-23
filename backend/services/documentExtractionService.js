import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import pool from '../config/db.js';
import { extractEntities } from '../ai/entityExtractor.js';
import { extractClaimFields as aiExtractClaimFields } from '../ai/claimFieldExtractor.js';
import { recordDocumentVersion } from '../utils/documentVersionLogger.js';
import logger from '../utils/logger.js';
import { DocumentType } from '../enums/documentType.js';
import { extractDuration } from '../metrics.js';
import { processImageMultimodal } from './multimodalProcessingService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function refreshSearchable(id) {
  await pool.query(
    "UPDATE documents SET searchable = to_tsvector('english', coalesce(fields::text,'') || ' ' || coalesce(raw_text,'')) WHERE id = $1",
    [id]
  );
}

async function resolveSchema(preset) {
  if (!preset) return undefined;
  try {
    const schemaPath = path.join(__dirname, '../schemas', `${preset}.json`);
    if (fs.existsSync(schemaPath)) {
      return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    }
  } catch (err) {
    logger.warn('Failed to load schema preset', { preset, error: err.message });
  }
  return null;
}

async function extractFieldsForDocument(doc) {
  const pipelinePath = path.join(__dirname, '../pipelines', `${doc.doc_type}.js`);
  let result = { fields: {} };
  const safeText = doc.contains_phi && doc.raw_text
    ? doc.raw_text.slice(0, 4000)
    : fs.readFileSync(doc.path, 'utf8').slice(0, 4000);
  if (
    [
      DocumentType.CLAIM_INVOICE,
      DocumentType.MEDICAL_BILL,
      DocumentType.FNOL_FORM,
    ].includes(doc.doc_type)
  ) {
    result = await aiExtractClaimFields(safeText);
  } else if (fs.existsSync(pipelinePath)) {
    const pipeline = await import(pathToFileURL(pipelinePath).href);
    result = await pipeline.default(doc.path);
  } else {
    result.fields = await extractEntities(safeText);
  }

  const fields = [
    DocumentType.CLAIM_INVOICE,
    DocumentType.MEDICAL_BILL,
    DocumentType.FNOL_FORM,
  ].includes(doc.doc_type)
    ? result.fields
    : {
        party_name: result.fields.vendor || result.fields.party_name,
        total_amount: result.fields.amount || result.fields.total_amount,
        doc_date: result.fields.date || result.fields.doc_date,
        category: result.fields.category,
      };

  return fields;
}

export async function processDocumentExtraction({ documentId, schemaPreset, user }) {
  const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [documentId]);
  if (!rows.length) {
    throw new Error('Document not found');
  }
  const doc = rows[0];
  const endTimer = extractDuration.startTimer({ doc_type: doc.doc_type });

  try {
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['processing', documentId]);
    const fields = await extractFieldsForDocument(doc);
    const schema = await resolveSchema(schemaPreset);
    let multimodal = null;
    const isImage = typeof doc.file_type === 'string' && doc.file_type.startsWith('image/');
    if (isImage) {
      multimodal = await processImageMultimodal({ documentId, filePath: doc.path });
    }

    const rawMetadata = doc.metadata;
    let parsedMetadata = rawMetadata;
    if (rawMetadata && typeof rawMetadata === 'string') {
      try {
        parsedMetadata = JSON.parse(rawMetadata);
      } catch (error) {
        parsedMetadata = {};
      }
    }
    const mergedMetadata = multimodal
      ? { ...(parsedMetadata || {}), multimodal }
      : parsedMetadata;

    if (multimodal) {
      await pool.query(
        'UPDATE documents SET fields = $1, status = $2, metadata = $3 WHERE id = $4',
        [fields, 'extracted', mergedMetadata, documentId]
      );
    } else {
      await pool.query(
        'UPDATE documents SET fields = $1, status = $2 WHERE id = $3',
        [fields, 'extracted', documentId]
      );
    }
    await refreshSearchable(documentId);
    await recordDocumentVersion(
      documentId,
      doc,
      { ...doc, fields, metadata: mergedMetadata },
      user?.userId,
      user?.username
    );
    logger.info('Fields extracted', { id: documentId });

    return { fields, schema, confidence: 0.9, multimodal };
  } catch (err) {
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['failed', documentId]).catch(() => {});
    logger.error('Extract error:', err);
    throw err;
  } finally {
    if (typeof endTimer === 'function') endTimer();
  }
}
