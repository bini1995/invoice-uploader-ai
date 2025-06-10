const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'admin',
  },
  {
    id: 2,
    username: 'viewer',
    passwordHash: bcrypt.hashSync('viewerpass', 10),
    role: 'viewer',
  },
  {
    id: 3,
    username: 'approver',
    passwordHash: bcrypt.hashSync('approverpass', 10),
    role: 'approver',
  },
];

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, 'secretKey123', { expiresIn: '1h' });
  res.json({ token, role: user.role });
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
