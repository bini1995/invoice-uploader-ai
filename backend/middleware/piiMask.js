function mask(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  if (out.vendor) out.vendor = out.vendor[0] + '***';
  if (out.invoice_number) out.invoice_number = '****' + out.invoice_number.slice(-4);
  if (out.policyholder_name) out.policyholder_name = out.policyholder_name[0] + '*** ' + out.policyholder_name.split(' ').slice(-1);
  if (out.email) out.email = out.email[0] + '***@***' + out.email.slice(-3);
  return out;
}

export default function piiMask(req, res, next) {
  const send = res.json.bind(res);
  res.json = (data) => {
    if (req.user && req.user.role !== 'admin') {
      if (Array.isArray(data)) data = data.map(mask);
      else data = mask(data);
    }
    return send(data);
  };
  next();
}
