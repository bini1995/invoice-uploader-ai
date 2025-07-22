const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const openrouter = require('../config/openrouter');
const { trainFromCorrections } = require('../utils/ocrAgent');
const { extractEntities } = require('../ai/entityExtractor');
const { recordDocumentVersion } = require('../utils/documentVersionLogger');
const crypto = require('crypto');
const { DocumentType } = require('../enums/documentType');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const prompt = `Classify this document into types like Invoice, Receipt, Bank Statement, W-9 or Contract. File name: ${req.file.originalname}`;
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
    const { rows } = await pool.query(
      'INSERT INTO documents (tenant_id, file_name, doc_type, document_type, path, retention_policy, delete_at, expires_at, expiration, status, version, metadata, type, content_hash, doc_title) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id',
      [req.tenantId, req.file.originalname, docType, docType, destPath, retention, deleteAt, expiresAt, expiration, 'pending', 1, meta, docType, contentHash, docTitle]
    );


    res.json({ id: rows[0].id, status: 'pending', doc_type: docType });
  } catch (err) {
    console.error('Document upload error:', err.message);
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.extractDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const doc = rows[0];
    const pipelinePath = path.join(__dirname, '../pipelines', `${doc.doc_type}.js`);
    let result = { fields: {} };
    if (fs.existsSync(pipelinePath)) {
      const pipeline = require(pipelinePath);
      result = await pipeline(doc.path);
    } else {
      const content = fs.readFileSync(doc.path, 'utf8').slice(0, 4000);
      result.fields = await extractEntities(content);
    }
    const norm = {
      party_name: result.fields.vendor || result.fields.party_name,
      total_amount: result.fields.amount || result.fields.total_amount,
      doc_date: result.fields.date || result.fields.doc_date,
      category: result.fields.category,
    };
    await pool.query('UPDATE documents SET fields = $1 WHERE id = $2', [norm, id]);
    await recordDocumentVersion(id, doc, { ...doc, fields: norm }, req.user?.userId, req.user?.username);
    res.json({ data: norm, confidence: 0.9 });
  } catch (err) {
    console.error('Extract error:', err.message);
    res.status(500).json({ message: 'Extraction failed' });
  }
};

exports.saveCorrections = async (req, res) => {
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
    await recordDocumentVersion(id, before, { ...before, fields: updatedFields }, req.user?.userId, req.user?.username);
    res.json({ message: 'Corrections saved' });
  } catch (err) {
    console.error('Save correction error:', err.message);
    res.status(500).json({ message: 'Failed to save corrections' });
  }
};

exports.summarizeDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const doc = rows[0];
    const content = fs.readFileSync(doc.path, 'utf8').slice(0, 4000);
    const summary = await require('./aiAgent').summarize(content, doc.doc_type);
    res.json({ summary });
  } catch (err) {
    console.error('Document summary error:', err.message);
    res.status(500).json({ message: 'Failed to summarize document' });
  }
};

exports.getDocumentVersions = async (req, res) => {
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

exports.restoreDocumentVersion = async (req, res) => {
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

exports.uploadDocumentVersion = async (req, res) => {
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

exports.updateLifecycle = async (req, res) => {
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

exports.checkCompliance = async (req, res) => {
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

exports.getEntityTotals = async (_req, res) => {
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

exports.autoDeleteExpiredDocuments = async () => {
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
