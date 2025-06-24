const axios = require('axios');
const { sendMail } = require('./email');

exports.sendSlackNotification = async (message) => {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: message });
  } catch (err) {
    console.error('Slack notification error:', err.message);
  }
};

exports.sendTeamsNotification = async (message) => {
  if (!process.env.TEAMS_WEBHOOK_URL) return;
  try {
    await axios.post(process.env.TEAMS_WEBHOOK_URL, { text: message });
  } catch (err) {
    console.error('Teams notification error:', err.message);
  }
};

exports.sendEmailNotification = async (to, subject, message) => {
  const recipient = to || process.env.EMAIL_TO;
  if (!recipient) return;
  try {
    await sendMail({ to: recipient, subject: subject || 'Invoice Alert', text: message });
  } catch (err) {
    console.error('Email notification error:', err.message);
  }
};

exports.sendSmsNotification = async (to, message) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !to) return;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const payload = new URLSearchParams({ From: TWILIO_FROM_NUMBER, To: to, Body: message });
  try {
    await axios.post(url, payload, { auth: { username: TWILIO_ACCOUNT_SID, password: TWILIO_AUTH_TOKEN } });
  } catch (err) {
    console.error('SMS notification error:', err.message);
  }
};
