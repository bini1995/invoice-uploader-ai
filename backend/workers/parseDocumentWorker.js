const parseDocumentQueue = require('../queues/parseDocumentQueue');
const pool = require('../config/db');
const { parseAndExtract } = require('../services/documentService');

parseDocumentQueue.process(async (job) => {
  const { docId } = job.data;
  const res = await pool.query('SELECT * FROM documents WHERE id = $1', [docId]);
  if (!res.rows.length) return;
  const doc = res.rows[0];
  try {
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['processing', docId]);
    await parseAndExtract(doc);
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['done', docId]);
  } catch (err) {
    console.error('Document parse failed:', err);
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['error', docId]);
    throw err;
  }
});
