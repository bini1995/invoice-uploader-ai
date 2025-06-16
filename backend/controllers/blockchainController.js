const pool = require('../config/db');
const { submitHashToBlockchain } = require('../utils/blockchain');

exports.recordHash = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('SELECT integrity_hash FROM invoices WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Invoice not found' });
    const hash = result.rows[0].integrity_hash;
    const bc = await submitHashToBlockchain(hash);
    const tx = bc.txId || null;
    await pool.query('UPDATE invoices SET blockchain_tx = $1 WHERE id = $2', [tx, id]);
    res.json({ tx });
  } catch (err) {
    console.error('recordHash error:', err.message);
    res.status(500).json({ message: 'Failed to record hash' });
  }
};

exports.verifyHash = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('SELECT integrity_hash, blockchain_tx FROM invoices WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('verifyHash error:', err.message);
    res.status(500).json({ message: 'Failed to verify hash' });
  }
};
