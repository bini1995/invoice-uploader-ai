const { trackEvent } = require('../utils/eventTracker');

exports.recordEvent = async (req, res) => {
  const { event, details } = req.body || {};
  if (!event) return res.status(400).json({ message: 'Missing event' });
  await trackEvent('default', req.user?.userId || null, event, details);
  res.json({ status: 'ok' });
};
