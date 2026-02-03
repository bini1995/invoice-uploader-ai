
// Ensure JWT secrets are present. In production we still require them, but
// during local development generate fallback secrets so the server can start
// and developers can log in without extra setup.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { logActivity } from '../utils/activityLogger.js';
import logger from '../utils/logger.js';
import { activeUsersGauge } from '../metrics.js';
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


export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tenantId = user.tenant_id || user.tenantId || 'default';
    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username, tenantId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const refreshTokenId = crypto.randomUUID();
    const refreshToken = jwt.sign(
      { userId: user.id, tokenId: refreshTokenId },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    if (req.session) {
      req.session.userId = user.id;
      req.session.refreshTokenId = refreshTokenId;
      req.session.username = user.username;
      await new Promise((resolve, reject) => {
        req.session.save((err) => (err ? reject(err) : resolve()));
      });
    }
    activeUsersGauge.inc();
    logger.info('User logged in', { userId: user.id });
    res.json({ token, refreshToken, role: user.role, username: user.username });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ message: 'Failed to login' });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !req.session?.refreshTokenId) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    if (decoded.tokenId !== req.session.refreshTokenId || decoded.userId !== req.session.userId) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid user' });
    const tenantId = user.tenant_id || user.tenantId || 'default';
    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username, tenantId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const newRefreshTokenId = crypto.randomUUID();
    const newRefreshToken = jwt.sign(
      { userId: user.id, tokenId: newRefreshTokenId },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    req.session.refreshTokenId = newRefreshTokenId;
    await new Promise((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });
    res.json({ token, refreshToken: newRefreshToken, role: user.role, username: user.username });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req, res) => {
  activeUsersGauge.dec();
  logger.info('User logged out');
  if (req.session) {
    await new Promise((resolve) => {
      req.session.destroy(() => resolve());
    });
  }
  res.json({ message: 'Logged out' });
};

export { authMiddleware };

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

export const getUsers = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username, role FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const addUser = async (req, res) => {
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

export const deleteUser = async (req, res) => {
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

export const updateUserRole = async (req, res) => {
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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, username FROM users WHERE username = $1 OR email = $1',
      [email]
    );
    
    if (rows.length > 0) {
      const user = rows[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 3600000);
      
      await pool.query(
        `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3`,
        [resetToken, resetExpiry, user.id]
      );
      
      logger.info('Password reset requested', { userId: user.id, email });
    }
    
    res.json({ 
      message: 'If an account exists with that email, password reset instructions have been sent.' 
    });
  } catch (err) {
    logger.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process request' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, username FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );
    
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    const user = rows[0];
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [passwordHash, user.id]
    );
    
    logger.info('Password reset successful', { userId: user.id });
    await logActivity(user.id, 'password_reset', null, user.username);
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    logger.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

export { createUser, userExists };
