const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const openrouter = require('../config/openrouter');
const { trainFromCorrections } = require('../utils/ocrAgent');
const { extractEntities } = require('../ai/entityExtractor');
const { recordDocumentVersion } = require('../utils/documentVersionLogger');

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
    const destDir = path.join('uploads', 'documents', docType);
    fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, req.file.filename);
    fs.renameSync(req.file.path, destPath);
    const { rows } = await pool.query(
      'INSERT INTO documents (tenant_id, file_name, doc_type, path) VALUES ($1,$2,$3,$4) RETURNING id',
      [req.tenantId, req.file.originalname, docType, destPath]
    );

    const embeddingRes = await openrouter.embeddings.create({
      model: 'openai/text-embedding-ada-002',
      input: fs.readFileSync(destPath, 'utf8').slice(0, 2000)
    });
    const embedding = embeddingRes.data[0].embedding;
    await pool.query('UPDATE documents SET embedding = $1 WHERE id = $2', [embedding, rows[0].id]);
    const docRes = await pool.query('SELECT * FROM documents WHERE id = $1', [rows[0].id]);
    if (docRes.rows.length) {
      await recordDocumentVersion(docRes.rows[0].id, {}, docRes.rows[0], req.user?.userId, req.user?.username);
    }

    res.json({ id: rows[0].id, doc_type: docType });
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
    const content = fs.readFileSync(doc.path, 'utf8').slice(0, 4000);
    const data = await extractEntities(content);
    await pool.query('UPDATE documents SET fields = $1 WHERE id = $2', [data, id]);
    await recordDocumentVersion(id, doc, { ...doc, fields: data }, req.user?.userId, req.user?.username);
    res.json({ data, confidence: 0.9 });
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
    const prompt = `Summarize this document and list the key points.\n\n${content}`;
    const ai = await openrouter.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });
    const summary = ai.choices?.[0]?.message?.content?.trim();
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
