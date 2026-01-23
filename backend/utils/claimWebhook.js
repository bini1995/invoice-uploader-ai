
import crypto from 'crypto';
import fetch from 'node-fetch';
const url = process.env.CLAIM_STATUS_WEBHOOK_URL;
const headersEnv = process.env.CLAIM_WEBHOOK_HEADERS || '{}';
const templateEnv = process.env.CLAIM_WEBHOOK_TEMPLATE || '{}';
const webhookSecret = process.env.CLAIM_WEBHOOK_SECRET;

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

export const triggerClaimWebhook = async (event, payload = {}) => {
  if (!url) return;
  if (!webhookSecret) {
    console.warn('CLAIM_WEBHOOK_SECRET is required to send claim webhooks securely.');
    return;
  }
  const body = {
    event,
    updated_at: new Date().toISOString(),
    ...template,
    ...payload
  };
  const bodyString = JSON.stringify(body);
  const signature = crypto.createHmac('sha256', webhookSecret).update(bodyString).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
    'X-Webhook-Signature': `sha256=${signature}`
  };
  try {
    await fetch(url, {
      method: 'POST',
      headers,
      body: bodyString
    });
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
};
