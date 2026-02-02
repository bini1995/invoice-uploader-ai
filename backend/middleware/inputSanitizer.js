const SQL_INJECTION_PATTERNS = [
  /(\b(select|insert|update|delete|drop|create|alter|exec|execute|xp_|sp_|0x)\b)/gi,
  /(union\s+(all\s+)?select)/gi,
  /(--|\#|\/\*|\*\/)/g,
  /(\bor\b\s*\d+\s*=\s*\d+)/gi,
  /(\band\b\s*\d+\s*=\s*\d+)/gi,
];

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

function containsMaliciousPatterns(value) {
  if (typeof value !== 'string') return false;
  
  for (const pattern of [...SQL_INJECTION_PATTERNS, ...XSS_PATTERNS]) {
    if (pattern.test(value)) {
      return true;
    }
  }
  return false;
}

function scanObject(obj, path = '') {
  if (!obj || typeof obj !== 'object') {
    if (containsMaliciousPatterns(obj)) {
      return path || 'value';
    }
    return null;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'string') {
      if (containsMaliciousPatterns(value)) {
        return currentPath;
      }
    } else if (typeof value === 'object' && value !== null) {
      const result = scanObject(value, currentPath);
      if (result) return result;
    }
  }
  
  return null;
}

export default function inputSanitizer(req, res, next) {
  if (req.path.startsWith('/api/health') || req.path.startsWith('/metrics')) {
    return next();
  }

  const suspiciousField = scanObject(req.body) || scanObject(req.query);
  
  if (suspiciousField) {
    console.warn(`[SECURITY] Suspicious input detected in ${suspiciousField} from IP ${req.ip}`);
    return res.status(400).json({
      error: 'Invalid input detected',
      code: 'MALICIOUS_INPUT'
    });
  }
  
  next();
}
