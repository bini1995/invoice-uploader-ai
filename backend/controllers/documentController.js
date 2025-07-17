const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const openrouter = require('../config/openrouter');
const { trainFromCorrections } = require('../utils/ocrAgent');

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
    const prompt = `Extract key fields and values from this document as JSON.\n\n${content}`;
    const ai = await openrouter.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });
    let data;
    try { data = JSON.parse(ai.choices[0].message.content); } catch { data = { raw: ai.choices[0].message.content }; }
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
    res.json({ message: 'Corrections saved' });
  } catch (err) {
    console.error('Save correction error:', err.message);
    res.status(500).json({ message: 'Failed to save corrections' });
  }
};
