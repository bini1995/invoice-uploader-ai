const client = require('prom-client');

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const claimUploadCounter = new client.Counter({
  name: 'claim_upload_total',
  help: 'Total number of claim uploads',
  labelNames: ['doc_type']
});

const fieldExtractCounter = new client.Counter({
  name: 'claim_field_extraction_total',
  help: 'Total number of claim field extractions',
  labelNames: ['doc_type']
});

const exportAttemptCounter = new client.Counter({
  name: 'export_attempt_total',
  help: 'Total number of export attempts',
  labelNames: ['export_type']
});

const feedbackFlaggedCounter = new client.Counter({
  name: 'feedback_flagged_total',
  help: 'Total number of feedback items flagged'
});

const activeUsersGauge = new client.Gauge({
  name: 'active_users',
  help: 'Current number of active users'
});

const extractDuration = new client.Histogram({
  name: 'claim_extraction_duration_seconds',
  help: 'Time spent extracting fields',
  labelNames: ['doc_type']
});
const exportDuration = new client.Histogram({
  name: 'export_duration_seconds',
  help: 'Time spent generating exports',
  labelNames: ['export_type']
});

module.exports = {
  register: client.register,
  claimUploadCounter,
  fieldExtractCounter,
  exportAttemptCounter,
  feedbackFlaggedCounter,
  activeUsersGauge,
  extractDuration,
  exportDuration
};
