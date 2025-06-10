const pool = require('../config/db');
const { logFeedback } = require('./aiController');

exports.submitFeedback = async (req, res) => {
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

exports.getFeedback = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT endpoint, AVG(rating) AS avg_rating, COUNT(*) AS count FROM feedback GROUP BY endpoint ORDER BY endpoint'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Feedback fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};
