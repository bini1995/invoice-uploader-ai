const pool = require('../config/db');
let diff;

async function getDiff() {
  if (!diff) {
    ({ diff } = await import('jsondiffpatch'));
  }
  return diff;
}

async function recordDocumentVersion(documentId, oldDoc, newDoc, userId, username) {
  try {
    const diffFn = await getDiff();
    const changes = diffFn(oldDoc, newDoc) || {};
    await pool.query(
      'INSERT INTO document_versions (document_id, editor_id, editor_name, diff, snapshot) VALUES ($1,$2,$3,$4,$5)',
      [documentId, userId || null, username || null, changes, newDoc]
    );
  } catch (err) {
    console.error('Document version log error:', err);
  }
}

module.exports = { recordDocumentVersion };
