const SQL_INJECTION_PATTERNS = [
  /(union\s+(all\s+)?select)/gi,
  /(\bexec\s*\(|xp_|sp_cmdshell)/gi,
  /(;\s*(drop|alter|truncate)\s+)/gi,
  /('\s*(or|and)\s+\d+\s*=\s*\d+)/gi,
  /(0x[0-9a-f]{8,})/gi,
];

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on(error|load|click|mouseover|focus|blur)\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

function containsMaliciousPatterns(value) {
  if (typeof value !== 'string') return false;
  
  for (const pattern of [...SQL_INJECTION_PATTERNS, ...XSS_PATTERNS]) {
    pattern.lastIndex = 0;
    if (pattern.test(value)) {
      return true;
    }
  }
  return false;
}

function scanObject(obj, path = '', depth = 0) {
  if (depth > 10) return null;
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
      const result = scanObject(value, currentPath, depth + 1);
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
