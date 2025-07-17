const pool = require('../config/db');

exports.getOpsTimeline = async (_req, res) => {
  try {
    const { rows: acts } = await pool.query(
      'SELECT created_at, action AS detail FROM activity_logs ORDER BY created_at DESC LIMIT 50'
    );
    const { rows: noti } = await pool.query(
      'SELECT created_at, message AS detail FROM notifications ORDER BY created_at DESC LIMIT 50'
    );
    const timeline = acts.map(a => ({ ...a, type: 'activity' }))
      .concat(noti.map(n => ({ ...n, type: 'notification' })))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ timeline });
  } catch (err) {
    console.error('Timeline error:', err.message);
    res.status(500).json({ message: 'Failed to load timeline' });
  }
};
