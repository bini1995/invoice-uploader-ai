const nodemailer = require('nodemailer');
require('dotenv').config();

function createTransporter() {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not configured. Emails will not be sent.');
    return null;
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

async function sendMail(options) {
  const transporter = createTransporter();
  if (!transporter) throw new Error('Email credentials not configured');
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, ...options });
  } catch (err) {
    if (err.code === 'EAUTH') {
      console.error('Email auth failed. Verify EMAIL_USER and EMAIL_PASS. If using Gmail, create an App Password.');
    }
    throw err;
  }
}

module.exports = { createTransporter, sendMail };
