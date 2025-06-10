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
