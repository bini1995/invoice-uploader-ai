const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { sendMail } = require('./email');
// Use the generic document upload since invoice controller was removed
const { uploadDocument } = require('../controllers/documentController');

// Gmail ingestion temporarily disabled

const inbox = process.env.EMAIL_INBOX || 'invoices@company.com';

async function processMessage(gmail, message) {
  const msg = await gmail.users.messages.get({ userId: inbox, id: message.id });
  const headers = {};
  (msg.data.payload.headers || []).forEach(h => { headers[h.name.toLowerCase()] = h.value; });
  const from = headers['from'] || '';
  const match = from.match(/<(.+?)>/);
  const sender = match ? match[1] : from;
  const parts = msg.data.payload.parts || [];
  for (const part of parts) {
    if (!part.filename || !part.body || !part.body.attachmentId) continue;
    const ext = path.extname(part.filename).toLowerCase();
    if (!['.pdf', '.csv', '.png', '.jpg', '.jpeg'].includes(ext)) continue;
    const att = await gmail.users.messages.attachments.get({
      userId: inbox,
      messageId: message.id,
      id: part.body.attachmentId,
    });
    const data = Buffer.from(att.data.data, 'base64');
    const tmp = path.join('/tmp', `${message.id}-${part.filename}`);
    fs.writeFileSync(tmp, data);
    const req = {
      file: { path: tmp, originalname: part.filename, size: data.length },
      body: {},
      params: { tenantId: 'default' },
      headers: {},
      user: { userId: 0, username: sender },
    };
    const res = { status: () => ({ json: () => {} }), json: () => {} };
    try {
      await uploadDocument(req, res);
    } catch (err) {
      const logger = require('./logger');
      logger.error({ err }, 'Email attachment processing failed');
    }
    fs.unlinkSync(tmp);
  }
  await gmail.users.messages.modify({
    userId: inbox,
    id: message.id,
    requestBody: { removeLabelIds: ['UNREAD'] },
  });
  if (sender) {
    try {
      await sendMail({
        to: sender,
        subject: 'Invoice received',
        text: 'Your forwarded invoice was processed successfully.',
      });
    } catch (err) {
      const logger = require('./logger');
      logger.error({ err }, 'Confirmation email error');
    }
  }
}

async function fetchEmailAttachments() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.EMAIL_INBOX) {
      const logger = require('./logger');
      logger.warn('Skipping email sync: missing GOOGLE_SERVICE_ACCOUNT_KEY or EMAIL_INBOX');
      return;
    }
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/gmail.modify'],
    });
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
      userId: inbox,
      q: `to:${inbox} has:attachment is:unread`,
    });
    const messages = res.data.messages || [];
    if (messages.length) {
      const logger = require('./logger');
      logger.info(`📥 Found ${messages.length} invoice emails`);
    }
    for (const m of messages) {
      await processMessage(gmail, m);
    }
  } catch (err) {
    const logger = require('./logger');
    logger.error({ err }, 'Email sync error');
  }
}

function startEmailSync() {
  const { schedule } = require('./cronManager');
  // schedule('emailSync', '*/5 * * * *', fetchEmailAttachments);
}

module.exports = { startEmailSync };
