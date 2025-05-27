const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('password123', 10),
  },
];

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, 'secretKey123', { expiresIn: '1h' });
  res.json({ token });
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
