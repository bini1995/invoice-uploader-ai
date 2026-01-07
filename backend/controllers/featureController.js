
import pool from '../config/db.js';
export const submitFeature = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'text required' });
  try {
    await pool.query('INSERT INTO feature_requests (text) VALUES ($1)', [text]);
    res.json({ message: 'Feature suggestion submitted' });
  } catch (err) {
    console.error('Feature submit error:', err);
    res.status(500).json({ message: 'Failed to submit suggestion' });
  }
};

export const listFeatures = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feature_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Feature list error:', err);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
};
