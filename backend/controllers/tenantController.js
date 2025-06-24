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
