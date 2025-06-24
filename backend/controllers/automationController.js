const pool = require('../config/db');

exports.listAutomations = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM automations ORDER BY id ASC');
    res.json({ automations: rows });
  } catch (err) {
    console.error('List automations error:', err.message);
    res.status(500).json({ message: 'Failed to fetch automations' });
  }
};

exports.addAutomation = async (req, res) => {
  const { event, condition, action, config, cron, active } = req.body || {};
  if (!event || !action) return res.status(400).json({ message: 'event and action required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO automations (event, condition, action, config, cron, active)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,TRUE)) RETURNING *`,
      [event, condition || null, action, config ? JSON.stringify(config) : null, cron || null, active]
    );
    res.json({ automation: rows[0] });
  } catch (err) {
    console.error('Add automation error:', err.message);
    res.status(500).json({ message: 'Failed to add automation' });
  }
};

exports.updateAutomation = async (req, res) => {
  const id = parseInt(req.params.id);
  const { event, condition, action, config, cron, active } = req.body || {};
  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE automations SET
         event = COALESCE($1, event),
         condition = COALESCE($2, condition),
         action = COALESCE($3, action),
         config = COALESCE($4, config),
         cron = COALESCE($5, cron),
         active = COALESCE($6, active)
       WHERE id = $7 RETURNING *`,
      [event, condition, action, config ? JSON.stringify(config) : null, cron, active, id]
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Automation not found' });
    res.json({ automation: rows[0] });
  } catch (err) {
    console.error('Update automation error:', err.message);
    res.status(500).json({ message: 'Failed to update automation' });
  }
};

exports.deleteAutomation = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM automations WHERE id = $1', [id]);
    res.json({ message: 'Automation deleted' });
  } catch (err) {
    console.error('Delete automation error:', err.message);
    res.status(500).json({ message: 'Failed to delete automation' });
  }
};
