const crypto = require('crypto');
const pool = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const { createUser, userExists } = require('./userController');

exports.createInvite = async (req, res) => {
  const { role = 'viewer', expiresInHours = 24 } = req.body || {};
  if (!['viewer', 'editor'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  try {
    await pool.query(
      'INSERT INTO invites (token, role, expires_at, created_by) VALUES ($1,$2,$3,$4)',
      [token, role, expiresAt, req.user?.userId]
    );
    logActivity(req.user?.userId, 'create_invite', null, req.user?.username);
    res.json({ url: `/api/invites/${token}` });
  } catch (err) {
    console.error('Create invite error:', err);
    res.status(500).json({ message: 'Failed to create invite' });
  }
};

exports.acceptInvite = async (req, res) => {
  const { token } = req.params;
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM invites WHERE token = $1', [token]);
    if (
      rows.length === 0 ||
      rows[0].used ||
      new Date(rows[0].expires_at) < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired invite' });
    }
    if (await userExists(username)) {
      return res.status(400).json({ message: 'User exists' });
    }
    const user = await createUser(username, password, rows[0].role);
    await pool.query('UPDATE invites SET used = TRUE WHERE token = $1', [token]);
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    console.error('Accept invite error:', err);
    res.status(500).json({ message: 'Failed to accept invite' });
  }
};
