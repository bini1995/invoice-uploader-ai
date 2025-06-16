const settings = require('../config/settings');

exports.getSettings = (_req, res) => {
  res.json(settings);
};

exports.updateSettings = (req, res) => {
  const allowed = ['autoArchive', 'emailTone', 'csvSizeLimitMB', 'pdfSizeLimitMB'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      settings[key] = req.body[key];
    }
  }
  res.json(settings);
};
