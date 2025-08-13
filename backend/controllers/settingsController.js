const settings = require('../config/settings');
const { validateSettings } = require('../validation/settingsSchema');
const { logActivity } = require('../utils/activityLogger');
const { trackEvent } = require('../utils/eventTracker');

exports.getSettings = (_req, res) => {
  res.json(settings);
};

exports.updateSettings = (req, res) => {
  const allowed = ['autoArchive', 'emailTone', 'csvSizeLimitMB', 'pdfSizeLimitMB', 'defaultRetention', 'showRoleEmojis'];
  let emojisChanged = false;
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (key === 'showRoleEmojis' && settings[key] !== req.body[key]) emojisChanged = true;
      settings[key] = req.body[key];
    }
  }
  validateSettings(settings);
  if (emojisChanged) {
    logActivity(req.user?.userId, 'toggle_role_emojis', null, req.user?.username);
    trackEvent('default', req.user?.userId, 'toggle_role_emojis', { enabled: settings.showRoleEmojis });
  }
  res.json(settings);
};
