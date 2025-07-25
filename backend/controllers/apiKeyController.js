const crypto = require('crypto');
const pool = require('../config/db');
const { logActivityDetailed } = require('../utils/activityLogger');

exports.createKey = async (req, res) => {
  const key = crypto.randomBytes(24).toString('hex');
  const { label } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO api_keys (user_id, api_key, label) VALUES ($1,$2,$3) RETURNING id, api_key, label, created_at',
      [req.user.userId, key, label || null]
    );
    await logActivityDetailed(
      'default',
      req.user.userId,
      req.user.username,
      'created_api_key',
      { keyId: rows[0].id, label }
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Create API key error:', err);
    res.status(500).json({ message: 'Failed to create key' });
  }
};

exports.listKeys = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, api_key, label, created_at FROM api_keys WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List API keys error:', err);
    res.status(500).json({ message: 'Failed to fetch keys' });
  }
};

exports.deleteKey = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM api_keys WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Key not found' });
    await logActivityDetailed(
      'default',
      req.user.userId,
      req.user.username,
      'deleted_api_key',
      { keyId: id }
    );
    res.json({ message: 'Key deleted' });
  } catch (err) {
    console.error('Delete API key error:', err);
    res.status(500).json({ message: 'Failed to delete key' });
  }
};

exports.updateLabel = async (req, res) => {
  const { id } = req.params;
  const { label } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE api_keys SET label = $1 WHERE id = $2 AND user_id = $3 RETURNING id, api_key, label, created_at',
      [label, id, req.user.userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Key not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update API key error:', err);
    res.status(500).json({ message: 'Failed to update key' });
  }
};
