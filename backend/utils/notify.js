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
  console.log('SMS alert stub:', { to, message });
};
