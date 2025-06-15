const axios = require('axios');

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
