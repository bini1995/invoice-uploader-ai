const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendSummaryEmail = async (req, res) => {
  const { aiSummary, invoices } = req.body;

  if (!aiSummary || !Array.isArray(invoices)) {
    return res.status(400).json({ message: 'Missing AI summary or invoice list.' });
  }

  const invoiceList = invoices.map(inv =>
    `• ${inv.invoice_number} - $${inv.amount} from ${inv.vendor} on ${inv.date}`
  ).join('\n');

  const emailContent = `
    Invoice Summary Report

    AI Summary:
    ${aiSummary}

    Uploaded Invoices:
    ${invoiceList}
  `;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use STARTTLS (TLS upgrade)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });
  

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Invoice Upload Summary',
      text: emailContent,
    });

    res.json({ message: '📧 Email sent successfully!' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ message: 'Failed to send email.' });
  }
};
