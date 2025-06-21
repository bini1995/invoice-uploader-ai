const pool = require('../config/db');
const { broadcastNotification } = require('../utils/chatServer');

exports.listNotifications = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Notification fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

exports.createNotification = async (req, res) => {
  const { user_id, message, type } = req.body || {};
  if (!user_id || !message) {
    return res.status(400).json({ message: 'Missing user_id or message' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3) RETURNING *',
      [user_id, message, type || null]
    );
    broadcastNotification?.(rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Notification create error:', err);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

exports.markRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Notification update error:', err);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};
