const { Parser } = require('json2csv');
const pool = require('../config/db');

exports.getTemplates = async (req, res) => {
  const userId = req.user?.userId;
  const tenantId = req.tenantId;
  try {
    const result = await pool.query(
      'SELECT id, name, columns FROM export_templates WHERE user_id = $1 AND tenant_id = $2 ORDER BY id DESC',
      [userId, tenantId]
    );
    res.json({ templates: result.rows });
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
};

exports.createTemplate = async (req, res) => {
  const userId = req.user?.userId;
  const tenantId = req.tenantId;
  const { name, columns } = req.body || {};
  if (!name || !Array.isArray(columns) || columns.length === 0) {
    return res.status(400).json({ message: 'name and columns required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO export_templates (user_id, tenant_id, name, columns) VALUES ($1,$2,$3,$4) RETURNING id, name, columns',
      [userId, tenantId, name, JSON.stringify(columns)]
    );
    res.json({ template: result.rows[0] });
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ message: 'Failed to create template' });
  }
};

exports.deleteTemplate = async (req, res) => {
  const userId = req.user?.userId;
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM export_templates WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error('Delete template error:', err);
    res.status(500).json({ message: 'Failed to delete template' });
  }
};

exports.exportWithTemplate = async (req, res) => {
  const userId = req.user?.userId;
  const tenantId = req.tenantId;
  const id = parseInt(req.params.id, 10);
  try {
    const tpl = await pool.query(
      'SELECT columns FROM export_templates WHERE id = $1 AND user_id = $2 AND tenant_id = $3',
      [id, userId, tenantId]
    );
    if (tpl.rows.length === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    const columns = tpl.rows[0].columns;
    const invRes = await pool.query(
      `SELECT ${columns.map((c) => '"' + c + '"').join(', ')} FROM invoices WHERE tenant_id = $1 ORDER BY id DESC`,
      [tenantId]
    );
    const parser = new Parser({ fields: columns });
    const csv = parser.parse(invRes.rows);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${tpl.rows[0].name || 'export'}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Export template error:', err);
    res.status(500).json({ message: 'Failed to export invoices' });
  }
};
