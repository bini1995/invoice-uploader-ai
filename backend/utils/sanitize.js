function maskSensitive(text) {
  if (!text || typeof text !== 'string') return text;
  // Mask email addresses
  let out = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED]');
  // Mask any JSON "prompt" fields
  out = out.replace(/("prompt"\s*:\s*")[^"]*(")/gi, '$1[REDACTED]$2');
  return out;
}

module.exports = { maskSensitive };
