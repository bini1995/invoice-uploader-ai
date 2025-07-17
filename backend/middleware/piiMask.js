function mask(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  if (out.vendor) out.vendor = out.vendor[0] + '***';
  if (out.invoice_number) out.invoice_number = '****' + out.invoice_number.slice(-4);
  return out;
}

module.exports = function piiMask(req, res, next) {
  const send = res.json.bind(res);
  res.json = (data) => {
    if (req.user && req.user.role !== 'admin') {
      if (Array.isArray(data)) data = data.map(mask);
      else data = mask(data);
    }
    return send(data);
  };
  next();
};
