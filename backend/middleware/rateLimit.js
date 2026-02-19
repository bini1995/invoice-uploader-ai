
import rateLimit from 'express-rate-limit';

function jsonHandler(msg) {
  return (_req, res) => {
    res.status(429).json({ status: 429, message: msg });
  };
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  handler: jsonHandler('Too many requests from this IP, please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/health') || req.path.startsWith('/metrics'),
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  handler: jsonHandler('Too many uploads from this IP, please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  handler: jsonHandler('Too many AI requests, please slow down.'),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: jsonHandler('Too many login attempts, please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  handler: jsonHandler('Too many export requests, please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
});

export { 
  apiLimiter,
  uploadLimiter, 
  aiLimiter, 
  authLimiter,
  exportLimiter,
};
