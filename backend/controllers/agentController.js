const { getSuggestions } = require('../utils/ocrAgent');
const { trainFromCorrections } = require('../utils/ocrAgent');

exports.getSmartSuggestions = async (req, res) => {
  const { invoice } = req.body || {};
  if (!invoice) return res.status(400).json({ message: 'invoice required' });
  try {
    const suggestions = getSuggestions(invoice);
    res.json({ suggestions });
  } catch (err) {
    console.error('Smart suggestion error:', err);
    res.status(500).json({ message: 'Failed to generate suggestions' });
  }
};

exports.retrain = async (_req, res) => {
  try {
    await trainFromCorrections();
    res.json({ message: 'Retraining complete' });
  } catch (err) {
    console.error('Retrain error:', err);
    res.status(500).json({ message: 'Retrain failed' });
  }
};

const pool = require('../config/db');
const openrouter = require('../config/openrouter');
const fs = require('fs');

exports.askDocument = async (req, res) => {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ message: 'question required' });
  try {
    const embedRes = await openrouter.embeddings.create({
      model: 'openai/text-embedding-ada-002',
      input: question
    });
    const qVec = embedRes.data[0].embedding;
    const { rows } = await pool.query(
      `SELECT dc.document_id, d.file_name, dc.content, dc.embedding
       FROM document_chunks dc
       JOIN documents d ON d.id = dc.document_id
       WHERE d.tenant_id = $1 AND dc.embedding IS NOT NULL`,
      [req.tenantId]
    );
    let best = null;
    let bestScore = -Infinity;
    for (const r of rows) {
      if (!Array.isArray(r.embedding)) continue;
      const score = r.embedding.reduce((s, v, i) => s + v * qVec[i], 0);
      if (score > bestScore) { best = r; bestScore = score; }
    }
    let context = best ? best.content.slice(0, 2000) : '';
    const ans = await openrouter.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You answer questions about business documents.' },
        { role: 'user', content: `${context}\n\nQuestion: ${question}` }
      ]
    });
    res.json({ answer: ans.choices[0].message.content, document_id: best?.document_id });
  } catch (err) {
    console.error('Ask document error:', err.message);
    res.status(500).json({ message: 'Failed to answer question' });
  }
};

