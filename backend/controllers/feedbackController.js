
import pool from '../config/db.js';
import { logFeedback } from './aiController.js';
export const submitFeedback = async (req, res) => {
  const { endpoint, rating } = req.body;
  if (!endpoint || typeof rating !== 'number') {
    return res.status(400).json({ message: 'endpoint and numeric rating required' });
  }
  try {
    await logFeedback(endpoint, rating);
    res.json({ message: 'Feedback recorded' });
  } catch (err) {
    console.error('Feedback submit error:', err);
    res.status(500).json({ message: 'Failed to save feedback' });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await pool.query(
      'SELECT endpoint, AVG(rating) AS avg_rating, COUNT(*) AS count FROM feedback GROUP BY endpoint ORDER BY endpoint LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Feedback fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};
