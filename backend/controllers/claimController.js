import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import openrouter from '../config/openrouter.js';
import { trainFromCorrections } from '../utils/ocrAgent.js';
import { extractEntities } from '../ai/entityExtractor.js';
import { extractClaimFields as aiExtractClaimFields } from '../ai/claimFieldExtractor.js';
import { recordDocumentVersion } from '../utils/documentVersionLogger.js';
import crypto from 'crypto';
import { DocumentType } from '../enums/documentType.js';
import PDFDocument from 'pdfkit';
import fileToText from '../utils/fileToText.js';
import { triggerClaimWebhook } from '../utils/claimWebhook.js';
import logger from '../utils/logger.js';
import { logActivity } from '../utils/activityLogger.js';
import sanitizeHtml from 'sanitize-html';
import { Parser } from 'json2csv';
import { fileURLToPath, pathToFileURL } from 'url';
import { summarize } from './aiAgent.js';
import { autoAssignDocument } from '../services/invoiceService.js';
import {
  claimUploadCounter,
  fieldExtractCounter,
  exportAttemptCounter,
  feedbackFlaggedCounter,
  extractDuration,
  claimMetricsDuration,
  claimMetricsErrorCounter
} from '../metrics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function refreshSearchable(id) {
  await pool.query(
    "UPDATE documents SET searchable = to_tsvector('english', coalesce(fields::text,'') || ' ' || coalesce(raw_text,'')) WHERE id = $1",
    [id]
  );
}

export const listDocuments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, doc_title, doc_type, file_name, fields, status
       FROM documents WHERE tenant_id = $1 ORDER BY id DESC LIMIT 100`,
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List claim documents error:', err);
    res.status(500).json({ message: 'Failed to fetch claim documents' });
  }
};

export const getDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND tenant_id = $2',
      [id, req.tenantId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get document error:', err);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
};
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    const prompt =
      `Classify this document into one of the following types: claim_invoice, medical_bill, fnol_form, invoice, receipt, bank_statement, w-9, contract. ` +
      `Return only the type name in lowercase with underscores. File name: ${req.file.originalname}`;
    const ai = await openrouter.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });
    let docType = ai.choices?.[0]?.message?.content?.trim().split(/\s/)[0] || 'other';
    docType = docType.toLowerCase();
    if (!Object.values(DocumentType).includes(docType)) docType = DocumentType.OTHER;
    const fileBuffer = fs.readFileSync(req.file.path);
    const contentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const destDir = path.join('uploads', 'documents', docType);
    fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, req.file.filename);
    fs.renameSync(req.file.path, destPath);
    const retention = req.body.retention || 'forever';
    let deleteAt = null;
    if (retention === '3mo') deleteAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    else if (retention === '1yr') deleteAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    else if (retention === '6m') deleteAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
    else if (retention === '2y') deleteAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
    const expiresAt = req.body.expires_at ? new Date(req.body.expires_at) : null;
    const meta = req.body.metadata ? req.body.metadata : {};
    const expiration = req.body.expiration ? new Date(req.body.expiration) : null;
    const docTitle = req.body.title || req.file.originalname;
    const rawText = await fileToText(destPath);
    const { rows } = await pool.query(
      'INSERT INTO documents (tenant_id, file_name, doc_type, document_type, path, retention_policy, delete_at, expires_at, expiration, status, version, metadata, type, content_hash, doc_title, file_type, raw_text) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id',
      [
        req.tenantId,
        req.file.originalname,
        docType,
        docType,
        destPath,
        retention,
        deleteAt,
        expiresAt,
        expiration,
        'pending',
        1,
        meta,
        docType,
        contentHash,
        docTitle,
        req.file.mimetype,
        rawText,
      ]
    );
    await refreshSearchable(rows[0].id);
    const embRes = await openrouter.embeddings.create({
      model: 'openai/text-embedding-ada-002',
      input: rawText.slice(0, 2000)
    });
    await pool.query(
      'INSERT INTO claim_embeddings (document_id, embedding) VALUES ($1,$2)',
      [rows[0].id, embRes.data[0].embedding]
    );
    logger.info('Claim uploaded', { id: rows[0].id, docType });
    claimUploadCounter.labels(docType).inc();
    const vendorName = meta.vendor || '';
    const { assignee, reason } = await autoAssignDocument(rows[0].id, vendorName, meta.tags || []);
    res.json({ id: rows[0].id, status: 'pending', doc_type: docType, assignee, assignment_reason: reason });
  } catch (err) {
    logger.error('Document upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

export const extractDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });

    const doc = rows[0];
    const endTimer = extractDuration.startTimer({ doc_type: doc.doc_type });
    const pipelinePath = path.join(
      __dirname,
      '../pipelines',
      `${doc.doc_type}.js`
    );
    let result = { fields: {} };
    if (
      [
        DocumentType.CLAIM_INVOICE,
        DocumentType.MEDICAL_BILL,
        DocumentType.FNOL_FORM,
      ].includes(doc.doc_type)
    ) {
      const content = fs
        .readFileSync(doc.path, 'utf8')
        .slice(0, 4000);
      result = await aiExtractClaimFields(content);
    } else if (fs.existsSync(pipelinePath)) {
      const pipeline = await import(pathToFileURL(pipelinePath).href);
      result = await pipeline.default(doc.path);
    } else {
      const content = fs
        .readFileSync(doc.path, 'utf8')
        .slice(0, 4000);
      result.fields = await extractEntities(content);
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

    const preset = req.query.schema;
    let schema;
    if (preset) {
      try {
        const schemaPath = path.join(__dirname, '../schemas', `${preset}.json`);
        if (fs.existsSync(schemaPath)) {
          schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        } else {
          schema = null;
        }
      } catch (e) {
        schema = null;
        logger.warn('Failed to load schema preset', { preset, error: e.message });
      }
    }

    await pool.query('UPDATE documents SET fields = $1 WHERE id = $2', [fields, id]);
    await refreshSearchable(id);
    await recordDocumentVersion(
      id,
      doc,
      { ...doc, fields },
      req.user?.userId,
      req.user?.username
    );
    logger.info('Fields extracted', { id });

    endTimer();
    res.json({ data: fields, schema, confidence: 0.9 });
  } catch (err) {
    logger.error('Extract error:', err);
    if (typeof endTimer === 'function') endTimer();
    res.status(500).json({ message: 'Extraction failed' });
  }
};

export const extractClaimFields = async (req, res) => {
  const { id } = req.params;
  let timer;
  try {
    const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });

    const doc = rows[0];
    timer = extractDuration.startTimer({ doc_type: doc.doc_type });
    const text = doc.raw_text || fs.readFileSync(doc.path, 'utf8').slice(0, 4000);
    const { fields, version } = await aiExtractClaimFields(text);
    await pool.query(
      `INSERT INTO claim_fields (document_id, fields, version, extracted_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (document_id) DO UPDATE SET
         fields = EXCLUDED.fields,
         version = EXCLUDED.version,
         extracted_at = EXCLUDED.extracted_at`,
      [id, fields, version]
    );
    timer();
    logger.info('Claim fields extracted', { id });
    res.json({ fields, version });
  } catch (err) {
    logger.error('Claim field extract error:', err);
    if (typeof timer === 'function') timer();
    res.status(500).json({ message: 'Extraction failed' });
  }
};


export const saveCorrections = async (req, res) => {
  const { id } = req.params;
  const corrections = req.body || {};
  if (!corrections || typeof corrections !== 'object') return res.status(400).json({ message: 'Invalid corrections' });
  try {
    for (const [field, value] of Object.entries(corrections)) {
      await pool.query(
        'INSERT INTO ocr_corrections (invoice_id, field, old_value, new_value, user_id) VALUES ($1,$2,$3,$4,$5)',
        [id, field, null, value, req.user?.userId]
      );
    }
    await trainFromCorrections();
    const beforeRes = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    const before = beforeRes.rows[0];
    const updatedFields = { ...(before.fields || {}), ...corrections };
    await pool.query('UPDATE documents SET fields = $1 WHERE id = $2', [updatedFields, id]);
    await refreshSearchable(id);
    await recordDocumentVersion(id, before, { ...before, fields: updatedFields }, req.user?.userId, req.user?.username);
    res.json({ message: 'Corrections saved' });
  } catch (err) {
    console.error('Save correction error:', err.message);
    res.status(500).json({ message: 'Failed to save corrections' });
  }
};

export const summarizeDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const doc = rows[0];
    const content = fs.readFileSync(doc.path, 'utf8').slice(0, 4000);
    const summary = await summarize(content, doc.doc_type);
    res.json({ summary });
  } catch (err) {
    console.error('Document summary error:', err.message);
    res.status(500).json({ message: 'Failed to summarize document' });
  }
};

export const getDocumentVersions = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT id, editor_name, diff, created_at FROM document_versions WHERE document_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch versions error:', err);
    res.status(500).json({ message: 'Failed to fetch versions' });
  }
};

export const restoreDocumentVersion = async (req, res) => {
  const { id, versionId } = req.params;
  try {
    const verRes = await pool.query(
      'SELECT snapshot FROM document_versions WHERE id = $1 AND document_id = $2',
      [versionId, id]
    );
    if (!verRes.rows.length) return res.status(404).json({ message: 'Version not found' });
    const snapshot = verRes.rows[0].snapshot;
    const keys = Object.keys(snapshot || {});
    if (!keys.length) return res.status(400).json({ message: 'Invalid snapshot' });
    const sets = [];
    const values = [];
    let idx = 1;
    for (const key of keys) {
      sets.push(`${key} = $${idx}`);
      values.push(snapshot[key]);
      idx++;
    }
    values.push(id);
    const before = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    await pool.query(`UPDATE documents SET ${sets.join(', ')} WHERE id = $${idx}`, values);
    await refreshSearchable(id);
    const after = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordDocumentVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ message: 'Document restored', document: after.rows[0] });
  } catch (err) {
    console.error('Restore version error:', err);
    res.status(500).json({ message: 'Failed to restore version' });
  }
};

export const uploadDocumentVersion = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Document not found' });
    const before = rows[0];
    const destDir = path.dirname(before.path);
    const destPath = path.join(destDir, req.file.filename);
    fs.renameSync(req.file.path, destPath);
    await pool.query('UPDATE documents SET path = $1, file_name = $2 WHERE id = $3', [destPath, req.file.originalname, id]);
    const afterRes = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    await recordDocumentVersion(id, before, afterRes.rows[0], req.user?.userId, req.user?.username);
    res.json({ message: 'Version uploaded', document: afterRes.rows[0] });
  } catch (err) {
    console.error('Upload version error:', err);
    res.status(500).json({ message: 'Failed to upload version' });
  }
};

export const updateLifecycle = async (req, res) => {
  const { id } = req.params;
  const { retention, expires_at, archived } = req.body || {};
  let deleteAt = null;
  if (retention === '3mo') deleteAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  else if (retention === '1yr') deleteAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  else if (retention === '6m') deleteAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
  else if (retention === '2y') deleteAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
  try {
    const before = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    await pool.query(
      `UPDATE documents SET retention_policy = COALESCE($1, retention_policy), delete_at = COALESCE($2, delete_at), expires_at = COALESCE($3, expires_at), archived = COALESCE($4, archived) WHERE id = $5`,
      [retention, deleteAt, expires_at ? new Date(expires_at) : null, archived, id]
    );
    const after = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordDocumentVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ message: 'Lifecycle updated' });
  } catch (err) {
    console.error('Lifecycle update error:', err);
    res.status(500).json({ message: 'Failed to update lifecycle' });
  }
};

export const checkCompliance = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Document not found' });
    const doc = rows[0];
    const text = fs.readFileSync(doc.path, 'utf8').toLowerCase();
    const clauses = ['governing law', 'termination', 'confidentiality'];
    const issues = [];
    if (doc.doc_type === 'contract') {
      for (const c of clauses) {
        if (!text.includes(c)) issues.push(`Missing clause: ${c}`);
      }
    }
    await pool.query('UPDATE documents SET compliance_issues = $1 WHERE id = $2', [JSON.stringify(issues), id]);
    res.json({ compliant: issues.length === 0, issues });
  } catch (err) {
    console.error('Compliance check error:', err);
    res.status(500).json({ message: 'Failed to check compliance' });
  }
};

export const getEntityTotals = async (_req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT fields->>'party_name' AS entity, SUM((fields->>'total_amount')::numeric) AS total
       FROM documents
       WHERE fields ? 'party_name' AND fields ? 'total_amount'
       GROUP BY entity
       ORDER BY total DESC`
    );
    const rows = result.rows.map(r => ({ entity: r.entity, total: parseFloat(r.total) }));
    res.json({ entityTotals: rows });
  } catch (err) {
    console.error('Entity totals error:', err);
    res.status(500).json({ message: 'Failed to fetch entity totals' });
  } finally {
    client.release();
  }
};

export const exportSummaryPDF = async (_req, res) => {
  try {
    const topRes = await pool.query(
      `SELECT vendor, SUM(amount) AS total FROM invoices GROUP BY vendor ORDER BY total DESC LIMIT 5`
    );
    const flaggedRes = await pool.query(
      `SELECT invoice_number, vendor, flag_reason FROM invoices WHERE flagged = TRUE ORDER BY updated_at DESC LIMIT 5`
    );
    const heatRes = await pool.query(
      `SELECT vendor, COUNT(*) FILTER (WHERE flagged OR (due_date < NOW() AND payment_status != 'Paid')) AS risk, COUNT(*) AS total FROM invoices GROUP BY vendor`
    );
    const heatmap = heatRes.rows.map(r => ({
      vendor: r.vendor,
      riskScore: r.total ? parseFloat(r.risk) / parseFloat(r.total) : 0
    }));
    const monthRes = await pool.query(
      `SELECT DATE_TRUNC('month', date) AS month, SUM(amount) AS total FROM invoices GROUP BY month ORDER BY month`
    );
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="summary.pdf"');
    doc.pipe(res);
    doc.fontSize(18).text('Document Ops Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text('Top Vendors');
    topRes.rows.forEach(r => {
      doc.fontSize(12).text(`${r.vendor}: $${parseFloat(r.total).toFixed(2)}`);
    });

    doc.addPage();
    doc.fontSize(16).text('Anomaly Heatmap');
    heatmap.forEach(h => {
      doc.fontSize(12).text(`${h.vendor}: ${(h.riskScore * 100).toFixed(0)}% risk`);
    });

    doc.addPage();
    doc.fontSize(16).text('Flagged Documents');
    flaggedRes.rows.forEach(f => {
      const reason = f.flag_reason || 'Flagged';
      doc.fontSize(12).text(`#${f.invoice_number} ${f.vendor} - ${reason}`);
    });

    doc.addPage();
    doc.fontSize(16).text('Monthly Totals');
    monthRes.rows.forEach(m => {
      doc.fontSize(12).text(`${m.month.toISOString().slice(0,7)}: $${parseFloat(m.total).toFixed(2)}`);
    });

    doc.end();
  } catch (err) {
    console.error('Summary PDF error:', err);
    res.status(500).json({ message: 'Failed to build report' });
  }
};

export const searchDocuments = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing query' });
  try {
    const { rows } = await pool.query(
      `SELECT id, doc_title, file_name, doc_type, fields
       FROM documents
       WHERE searchable @@ plainto_tsquery('english', $1)
       ORDER BY ts_rank(searchable, plainto_tsquery('english', $1)) DESC
       LIMIT 50`,
      [q]
    );
    res.json(rows);
  } catch (err) {
    console.error('Search documents error:', err);
    res.status(500).json({ message: 'Failed to search documents' });
  }
};

export const autoDeleteExpiredDocuments = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM documents WHERE delete_at IS NOT NULL AND delete_at < NOW()`
    );
    if (result.rowCount > 0) {
      console.log(`🗑️ Auto-deleted ${result.rowCount} documents`);
    }
  } catch (err) {
    console.error('Auto-delete documents error:', err);
  }
};

export const submitExtractionFeedback = async (req, res) => {
  const { id } = req.params;
  const { status, reason, note, assigned_to } = req.body || {};
  const allowed = ['correct', 'incorrect', 'needs_review'];
  if (!allowed.includes((status || '').toLowerCase())) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    await pool.query(
      `INSERT INTO extraction_feedback (document_id, status, reason, note, assigned_to)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (document_id) DO UPDATE SET
         status = EXCLUDED.status,
         reason = EXCLUDED.reason,
         note = EXCLUDED.note,
         assigned_to = COALESCE(EXCLUDED.assigned_to, extraction_feedback.assigned_to),
         created_at = NOW()`,
      [id, status.toLowerCase(), reason || null, note || null, assigned_to || null]
    );

    if (status.toLowerCase() !== 'correct') {
      feedbackFlaggedCounter.inc();
    }

    logger.info('Feedback saved', { id, status });

    if (note) {
      const userId = req.user?.id || null;
      await pool.query(
        `INSERT INTO review_notes (document_id, user_id, note)
         VALUES ($1,$2,$3)`,
        [id, userId, note]
      );
    }

    res.json({ message: 'Feedback saved' });
  } catch (err) {
    logger.error('Save feedback error:', err);
    res.status(500).json({ message: 'Failed to save feedback' });
  }
};

export const getExtractionFeedback = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT status, reason, note, assigned_to FROM extraction_feedback WHERE document_id = $1',
      [id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error('Fetch feedback error:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};

export const addReviewNote = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body || {};
  if (typeof note !== 'string') return res.status(400).json({ message: 'Note required' });
  const trimmed = note.trim();
  const sanitized = sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  if (sanitized !== trimmed)
    return res.status(400).json({ message: 'Unsafe HTML detected' });
  if (sanitized.length < 1 || sanitized.length > 1000)
    return res.status(400).json({ message: 'Note must be 1-1000 characters' });
  try {
    const userId = req.user?.userId || null;
    await pool.query(
      'INSERT INTO review_notes (document_id, user_id, note) VALUES ($1,$2,$3)',
      [id, userId, sanitized]
    );
    await logActivity(req.user?.userId, 'add_review_note', id, req.user?.username);
    res.json({ message: 'Note saved' });
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ message: 'Failed to save note' });
  }
};

export const getReviewNotes = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT n.id, n.note, n.created_at, u.username
       FROM review_notes n
       LEFT JOIN users u ON n.user_id = u.id
       WHERE n.document_id = $1
       ORDER BY n.created_at ASC`,
      [id]
    );
    res.json({ notes: rows });
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

export const addComment = async (req, res) => {
  const { id } = req.params;
  const { text, parent_id } = req.body || {};
  if (typeof text !== 'string') {
    return res
      .status(400)
      .json({
        type: 'https://example.com/validation-error',
        title: 'Validation error',
        detail: 'Text required'
      });
  }
  const trimmed = text.trim();
  const sanitized = sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  if (sanitized !== trimmed)
    return res
      .status(400)
      .json({
        type: 'https://example.com/validation-error',
        title: 'Validation error',
        detail: 'HTML not allowed'
      });
  if (sanitized.length < 1 || sanitized.length > 1000)
    return res
      .status(400)
      .json({
        type: 'https://example.com/validation-error',
        title: 'Validation error',
        detail: 'Comment must be 1-1000 characters'
      });
  try {
    const docCheck = await pool.query('SELECT id FROM documents WHERE id = $1', [id]);
    if (!docCheck.rows.length) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const userId = req.user?.userId || null;
    const { rows } = await pool.query(
      'INSERT INTO claim_comments (document_id, user_id, parent_id, text) VALUES ($1,$2,$3,$4) RETURNING id, parent_id, text, created_at',
      [id, userId, parent_id || null, sanitized]
    );
    await logActivity(req.user?.userId, 'add_comment', id, req.user?.username);
    const comment = rows[0];
    res
      .status(201)
      .set('Location', `/api/claims/${id}/comments/${comment.id}`)
      .json(comment);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Failed to save comment' });
  }
};

export const getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const docCheck = await pool.query('SELECT id FROM documents WHERE id = $1', [id]);
    if (!docCheck.rows.length) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const { rows } = await pool.query(
      'SELECT id, parent_id, text, created_at FROM claim_comments WHERE document_id = $1 ORDER BY created_at ASC',
      [id]
    );
    const map = new Map();
    rows.forEach((r) => {
      r.children = [];
      map.set(r.id, r);
    });
    const roots = [];
    rows.forEach((r) => {
      if (r.parent_id && map.has(r.parent_id)) map.get(r.parent_id).children.push(r);
      else roots.push(r);
    });
    const flat = [];
    const walk = (node, depth) => {
      flat.push({ id: node.id, parent_id: node.parent_id, depth, text: node.text, created_at: node.created_at });
      node.children
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .forEach((c) => walk(c, depth + 1));
    };
    roots
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .forEach((r) => walk(r, 0));
    const etag = crypto.createHash('md5').update(JSON.stringify(flat)).digest('hex');
    if (req.headers['if-none-match'] === etag) return res.status(304).end();
    res.set('ETag', etag);
    res.json({ comments: flat });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const getReviewQueue = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.doc_title, d.doc_type, f.status, f.reason, f.assigned_to
       FROM extraction_feedback f
       JOIN documents d ON f.document_id = d.id
       WHERE f.status IN ('incorrect','needs_review')
       ORDER BY f.created_at DESC`
    );
    res.json({ documents: rows });
  } catch (err) {
    console.error('Review queue error:', err);
    res.status(500).json({ message: 'Failed to fetch queue' });
  }
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: 'Status required' });
  try {
    const allowedTransitions = {
      extracted: ['needs_review'],
      needs_review: ['approved', 'escalated', 'needs_info'],
      needs_info: ['needs_review'],
      approved: [],
      escalated: []
    };
    const before = await pool.query('SELECT status FROM documents WHERE id = $1', [id]);
    const current = before.rows[0]?.status;
    if (!current) return res.status(404).json({ message: 'Document not found' });
    if (!(allowedTransitions[current] || []).includes(status)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }
    const { rows } = await pool.query(
      'UPDATE documents SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, id]
    );
    const previous = current;
    triggerClaimWebhook('status_changed', {
      claim_id: id,
      previous_status: previous,
      new_status: status
    });
    let action = 'update_claim_status';
    if (status === 'approved') action = 'approve_claim';
    else if (status === 'needs_info') action = 'request_info_claim';
    else if (status === 'escalated') action = 'escalate_claim';
    await logActivity(req.user?.userId, action, id, req.user?.username);
    res.json({ message: 'Status updated', document: rows[0] });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

export const exportClaims = async (req, res) => {
  const format = (req.body && req.body.format) || 'csv';
  try {
    const result = await pool.query(
      'SELECT id, doc_title, doc_type, status, fields FROM documents WHERE tenant_id = $1',
      [req.tenantId]
    );
    const claims = result.rows.map((r) => ({
      id: r.id,
      title: r.doc_title,
      type: r.doc_type,
      status: r.status,
      fields: r.fields
    }));
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify({ claims }));
    }
    const parser = new Parser({ fields: ['id', 'title', 'type', 'status', 'fields'] });
    const csv = parser.parse(claims.map(c => ({ ...c, fields: JSON.stringify(c.fields || {}) })));
    res.header('Content-Type', 'text/csv');
    res.attachment('claims.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Claims export error:', err);
    res.status(500).json({ message: 'Failed to export claims' });
  }
};

export const getClaimMetrics = async (req, res) => {
  const { from, to } = req.query;
  const params = [];
  let where =
    "doc_type IN ('claim_invoice','medical_bill','fnol_form')";
  if (from) {
    params.push(new Date(from));
    where += ` AND created_at >= $${params.length}`;
  }
  if (to) {
    params.push(new Date(to));
    where += ` AND created_at <= $${params.length}`;
  }
  const endTimer = claimMetricsDuration.startTimer();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.set('X-Request-Id', requestId);
  logger.info('Claim metrics requested', { request_id: requestId, from, to });
  try {
    const totalRes = await pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'Flagged') AS flagged
         FROM documents WHERE ${where}`,
      params
    );
    const statusRes = await pool.query(
      `SELECT status, COUNT(*)::int AS count
         FROM documents WHERE ${where} GROUP BY status`,
      params
    );
    const durationRes = await pool.query(
      `SELECT
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) AS avg,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) AS p50,
          PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) AS p90,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) AS p99
        FROM documents
        WHERE ${where} AND status IN ('Approved','Rejected','Closed')`,
      params
    );
    const total = parseInt(totalRes.rows[0].total, 10) || 0;
    const flagged = parseInt(totalRes.rows[0].flagged, 10) || 0;
    const status_counts = {};
    statusRes.rows.forEach((r) => {
      if (r.count >= 5) status_counts[r.status || 'Unknown'] = r.count;
    });
    res.set('Cache-Control', 'public, max-age=30');
    const { avg, p50, p90, p99 } = durationRes.rows[0] || {};
    const toNumber = (val) => {
      const num = Number(val);
      return Number.isFinite(num) ? num : 0;
    };
    res.json({
      window: { from: from || null, to: to || null, timezone: 'UTC' },
      definitions: {
        flagged: "status = 'Flagged'",
        avg_processing_hours:
          'mean hours between created_at and updated_at for closed claims',
      },
      total,
      flagged_rate: total ? flagged / total : 0,
      avg_processing_hours: toNumber(avg),
      p50_processing_hours: toNumber(p50),
      p90_processing_hours: toNumber(p90),
      p99_processing_hours: toNumber(p99),
      status_counts,
    });
    endTimer();
  } catch (err) {
    claimMetricsErrorCounter.inc();
    endTimer();
    console.error('Claim metrics error:', err);
    res.status(500).json({ message: 'Failed to fetch claim metrics' });
  }
};

export const getUploadHeatmap = async (req, res) => {
  res.json({ heatmap: [] });
};

export const getTopVendors = async (req, res) => {
  res.json({ topVendors: [] });
};
