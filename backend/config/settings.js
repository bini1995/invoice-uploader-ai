import { validateSettings } from '../validation/settingsSchema.js';
const settings = {
  autoArchive: true,
  emailTone: 'professional',
  csvSizeLimitMB: 5,
  pdfSizeLimitMB: 10,
  defaultCurrency: 'USD',
  defaultVatPercent: 0,
  defaultRetention: 'forever',
  // tenant setting: whether to show role emojis in the UI. default off for privacy.
  showRoleEmojis: false,
};

validateSettings(settings);

export default settings;
