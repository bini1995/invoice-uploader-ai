const cron = require('node-cron');
const { google } = require('googleapis');

async function fetchEmailAttachments() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/gmail.readonly']
    });
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
      userId: 'invoices@company.com',
      q: 'has:attachment is:unread'
    });
    const messages = res.data.messages || [];
    if (messages.length) console.log(`📥 Found ${messages.length} invoice emails`);
    // Placeholder: actual attachment processing not implemented
  } catch (err) {
    console.error('Email sync error:', err.message);
  }
}

function startEmailSync() {
  cron.schedule('*/5 * * * *', fetchEmailAttachments);
}

module.exports = { startEmailSync };
