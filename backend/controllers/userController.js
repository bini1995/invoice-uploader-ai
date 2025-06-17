const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activityLogger');

const USERS = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'admin',
  },
  {
    id: 2,
    username: 'reviewer',
    passwordHash: bcrypt.hashSync('reviewerpass', 10),
    role: 'reviewer',
  },
  {
    id: 3,
    username: 'finance',
    passwordHash: bcrypt.hashSync('financepass', 10),
    role: 'finance',
  },
  {
    id: 5,
    username: 'legal',
    passwordHash: bcrypt.hashSync('legalpass', 10),
    role: 'legal',
  },
  {
    id: 4,
    username: 'readonly',
    passwordHash: bcrypt.hashSync('readonlypass', 10),
    role: 'readonly',
  },
];

const REFRESH_TOKENS = [];

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find((u) => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, username: user.username },
    'secretKey123',
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    'refreshSecret123',
    { expiresIn: '7d' }
  );
  REFRESH_TOKENS.push(refreshToken);
  res.json({ token, refreshToken, role: user.role, username: user.username });
};

exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !REFRESH_TOKENS.includes(refreshToken)) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  try {
    const decoded = jwt.verify(refreshToken, 'refreshSecret123');
    const user = USERS.find((u) => u.id === decoded.userId);
    if (!user) return res.status(401).json({ message: 'Invalid user' });
    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username },
      'secretKey123',
      { expiresIn: '15m' }
    );
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  const idx = REFRESH_TOKENS.indexOf(refreshToken);
  if (idx !== -1) REFRESH_TOKENS.splice(idx, 1);
  res.json({ message: 'Logged out' });
};

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'secretKey123');
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

exports.getUsers = (_req, res) => {
  const sanitized = USERS.map(({ passwordHash, ...rest }) => rest);
  res.json(sanitized);
};

exports.addUser = (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  if (USERS.find((u) => u.username === username)) {
    return res.status(400).json({ message: 'User exists' });
  }
  const id = USERS.length ? Math.max(...USERS.map((u) => u.id)) + 1 : 1;
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = { id, username, passwordHash, role };
  USERS.push(user);
  logActivity(req.user?.userId, 'add_user', null, req.user?.username);
  res.json({ id, username, role });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const idx = USERS.findIndex((u) => u.id === parseInt(id, 10));
  if (idx === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  USERS.splice(idx, 1);
  logActivity(req.user?.userId, 'delete_user', null, req.user?.username);
  res.json({ message: 'User deleted' });
};

exports.updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = USERS.find((u) => u.id === parseInt(id, 10));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.role = role;
  logActivity(req.user?.userId, 'update_user_role', null, req.user?.username);
  res.json({ id: user.id, username: user.username, role: user.role });
};
