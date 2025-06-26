const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

exports.uploadLogo = (req, res) => {
  const tenantId = req.tenantId;
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
  const tenantId = req.tenantId;
  const file = path.join(__dirname, '../uploads/logos', `${tenantId}.png`);
  if (fs.existsSync(file)) {
    return res.sendFile(file);
  }
  res.status(404).end();
};

exports.setAccentColor = async (req, res) => {
  const tenantId = req.tenantId;
  const { color } = req.body || {};
  if (!color) return res.status(400).json({ message: 'Color required' });
  try {
    await pool.query(
      `INSERT INTO tenant_branding (tenant_id, accent_color)
       VALUES ($1,$2)
       ON CONFLICT (tenant_id) DO UPDATE SET accent_color = EXCLUDED.accent_color`,
      [tenantId, color]
    );
    res.json({ message: 'Color saved' });
  } catch (err) {
    console.error('Set color error:', err);
    res.status(500).json({ message: 'Failed to save color' });
  }
};

exports.getAccentColor = async (req, res) => {
  const tenantId = req.tenantId;
  try {
    const { rows } = await pool.query(
      'SELECT accent_color FROM tenant_branding WHERE tenant_id = $1',
      [tenantId]
    );
    if (rows.length) {
      return res.json({ color: rows[0].accent_color });
    }
    res.json({ color: null });
  } catch (err) {
    console.error('Get color error:', err);
    res.status(500).json({ message: 'Failed to fetch color' });
  }
};
