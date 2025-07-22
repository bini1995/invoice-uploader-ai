const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const openrouter = require('../config/openrouter');
const { extractEntities } = require('../ai/entityExtractor');
const { recordDocumentVersion } = require('../utils/documentVersionLogger');

async function parseAndExtract(doc) {
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
  await pool.query('UPDATE documents SET fields = $1 WHERE id = $2', [norm, doc.id]);
  await pool.query("UPDATE documents SET searchable = to_tsvector('english', fields::text) WHERE id = $1", [doc.id]);

  const embeddingRes = await openrouter.embeddings.create({
    model: 'openai/text-embedding-ada-002',
    input: fs.readFileSync(doc.path, 'utf8').slice(0, 2000)
  });
  const embedding = embeddingRes.data[0].embedding;
  await pool.query('UPDATE documents SET embedding = $1 WHERE id = $2', [embedding, doc.id]);

  const afterRes = await pool.query('SELECT * FROM documents WHERE id = $1', [doc.id]);
  if (afterRes.rows.length) {
    await recordDocumentVersion(doc.id, doc, afterRes.rows[0], null, null);
  }
}

module.exports = { parseAndExtract };
