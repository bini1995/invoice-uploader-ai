const pool = require('../config/db');

exports.getActivityLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Log fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};

exports.getInvoiceTimeline = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM activity_logs WHERE invoice_id = $1 ORDER BY created_at',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Timeline fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch timeline' });
  }
};
