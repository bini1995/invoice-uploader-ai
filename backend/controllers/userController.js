const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const logger = require('../utils/logger');
const { activeUsersGauge } = require('../metrics');

// Ensure JWT secrets are present. In production we still require them, but
// during local development generate fallback secrets so the server can start
// and developers can log in without extra setup.
let JWT_SECRET = process.env.JWT_SECRET;
let JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function ensureSecret(current, name) {
  if (current && current.length >= 32) return current;
  if (process.env.NODE_ENV === 'production') {
    logger.error(`${name} is missing or too short. Must be at least 32 characters.`);
    process.exit(1);
  }
  const generated = crypto.randomBytes(32).toString('hex');
  logger.warn(`${name} is missing or too short. Generated a development secret.`);
  return generated;
}

JWT_SECRET = ensureSecret(JWT_SECRET, 'JWT_SECRET');
JWT_REFRESH_SECRET = ensureSecret(JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
process.env.JWT_SECRET = JWT_SECRET;
process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;

const ALLOWED_ROLES = ['admin', 'viewer', 'broker', 'adjuster', 'medical_reviewer', 'auditor', 'internal_ops'];

async function userExists(username) {
  const { rows } = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
  return rows.length > 0;
}

async function createUser(username, password, role) {
  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3) RETURNING id, username, role',
    [username, passwordHash, role]
  );
  return rows[0];
}


exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    activeUsersGauge.inc();
    logger.info('User logged in', { userId: user.id });
    res.json({ token, refreshToken, role: user.role, username: user.username });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ message: 'Failed to login' });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid user' });
    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  activeUsersGauge.dec();
  logger.info('User logged out');
  res.json({ message: 'Logged out' });
};

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

exports.getUsers = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username, role FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.addUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    if (await userExists(username)) {
      return res.status(400).json({ message: 'User exists' });
    }
    const user = await createUser(username, password, role);
    await logActivity(req.user?.userId, 'add_user', null, req.user?.username);
    res.json(user);
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ message: 'Failed to add user' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    await logActivity(req.user?.userId, 'delete_user', null, req.user?.username);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role',
      [role, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    await logActivity(req.user?.userId, 'update_user_role', null, req.user?.username);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

exports.createUser = createUser;
exports.userExists = userExists;
