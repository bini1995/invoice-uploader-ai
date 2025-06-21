const fs = require('fs');
const path = require('path');

exports.uploadLogo = (req, res) => {
  const tenantId = req.params.tenantId || 'default';
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const dir = path.join(__dirname, '../uploads/logos');
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${tenantId}.png`);
  fs.rename(req.file.path, dest, (err) => {
    if (err) return res.status(500).json({ message: 'Failed to save logo' });
    res.json({ message: 'Logo uploaded' });
  });
};

exports.getLogo = (req, res) => {
  const tenantId = req.params.tenantId || 'default';
  const file = path.join(__dirname, '../uploads/logos', `${tenantId}.png`);
  if (fs.existsSync(file)) {
    return res.sendFile(file);
  }
  res.status(404).end();
};
