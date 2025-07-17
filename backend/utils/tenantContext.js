const pool = require('../config/db');

async function getTenantContext(tenantId = 'default') {
  const { rows } = await pool.query('SELECT feature, enabled FROM tenant_features WHERE tenant_id = $1', [tenantId]);
  const features = {};
  rows.forEach(r => { features[r.feature] = r.enabled; });
  const aiKey = process.env[`OPENROUTER_API_KEY_${tenantId.toUpperCase()}`] || process.env.OPENROUTER_API_KEY;
  return { tenantId, db: pool, features, aiKey };
}

async function checkTenantInvoiceLimit(tenantId, limit = 500) {
  const { rows } = await pool.query("SELECT COUNT(*) AS cnt FROM invoices WHERE tenant_id = $1 AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)", [tenantId]);
  return parseInt(rows[0].cnt, 10) < limit;
}

module.exports = { getTenantContext, checkTenantInvoiceLimit };
