const fetch = require('node-fetch');

const url = process.env.CLAIM_STATUS_WEBHOOK_URL;
const headersEnv = process.env.CLAIM_WEBHOOK_HEADERS || '{}';
const templateEnv = process.env.CLAIM_WEBHOOK_TEMPLATE || '{}';

let extraHeaders = {};
let template = {};
try {
  extraHeaders = JSON.parse(headersEnv);
} catch (_) {
  extraHeaders = {};
}
try {
  template = JSON.parse(templateEnv);
} catch (_) {
  template = {};
}

exports.triggerClaimWebhook = async (event, payload = {}) => {
  if (!url) return;
  const body = {
    event,
    updated_at: new Date().toISOString(),
    ...template,
    ...payload
  };
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
};
