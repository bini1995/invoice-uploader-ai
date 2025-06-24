const { getSuggestions } = require('../utils/ocrAgent');
const { trainFromCorrections } = require('../utils/ocrAgent');

exports.getSmartSuggestions = async (req, res) => {
  const { invoice } = req.body || {};
  if (!invoice) return res.status(400).json({ message: 'invoice required' });
  try {
    const suggestions = getSuggestions(invoice);
    res.json({ suggestions });
  } catch (err) {
    console.error('Smart suggestion error:', err);
    res.status(500).json({ message: 'Failed to generate suggestions' });
  }
};

exports.retrain = async (_req, res) => {
  try {
    await trainFromCorrections();
    res.json({ message: 'Retraining complete' });
  } catch (err) {
    console.error('Retrain error:', err);
    res.status(500).json({ message: 'Retrain failed' });
  }
};

