const pool = require('../config/db');

exports.getTenantFeatures = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT feature, enabled FROM tenant_features WHERE tenant_id = $1',
      [tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Tenant features fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch features' });
  }
};

exports.updateTenantFeature = async (req, res) => {
  const { tenantId } = req.params;
  const { feature, enabled } = req.body;
  if (!feature) return res.status(400).json({ message: 'feature required' });
  try {
    await pool.query(
      `INSERT INTO tenant_features (tenant_id, feature, enabled)
       VALUES ($1,$2,$3)
       ON CONFLICT (tenant_id, feature) DO UPDATE SET enabled = EXCLUDED.enabled`,
      [tenantId, feature, enabled]
    );
    res.json({ message: 'Feature updated' });
  } catch (err) {
    console.error('Tenant feature update error:', err);
    res.status(500).json({ message: 'Failed to update feature' });
  }
};

exports.getTenantInfo = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const { rows } = await pool.query('SELECT name FROM tenants WHERE tenant_id = $1', [tenantId]);
    res.json({ name: rows[0]?.name || tenantId });
  } catch (err) {
    console.error('Tenant info fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch tenant info' });
  }
};

exports.setTenantInfo = async (req, res) => {
  const { tenantId } = req.params;
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: 'name required' });
  try {
    await pool.query(
      `INSERT INTO tenants (tenant_id, name) VALUES ($1,$2) ON CONFLICT (tenant_id) DO UPDATE SET name = EXCLUDED.name`,
      [tenantId, name]
    );
    res.json({ message: 'Tenant updated' });
  } catch (err) {
    console.error('Tenant info set error:', err);
    res.status(500).json({ message: 'Failed to update tenant info' });
  }
};
