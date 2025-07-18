const fs = require('fs');
const crypto = require('crypto');
const pool = require('../config/db');
const { submitHashToBlockchain } = require('../utils/blockchain');

exports.createSigningRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT path FROM documents WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Document not found' });
    const fileBuffer = fs.readFileSync(rows[0].path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const bc = await submitHashToBlockchain(hash);
    await pool.query('UPDATE documents SET blockchain_tx = $1 WHERE id = $2', [bc.txId || null, id]);
    const url = `https://example.com/docusign/start?doc=${id}`;
    res.json({ url, tx: bc.txId || null });
  } catch (err) {
    console.error('Signing error:', err);
    res.status(500).json({ message: 'Failed to start signing' });
  }
};
