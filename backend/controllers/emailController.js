const { sendMail } = require('../utils/email');
require('dotenv').config();
const settings = require('../config/settings');

exports.sendSummaryEmail = async (req, res) => {
  const { aiSummary, invoices } = req.body;
  const tone = (req.body.tone || settings.emailTone || 'professional').toLowerCase();

  if (!aiSummary || !Array.isArray(invoices)) {
    return res.status(400).json({ message: 'Missing AI summary or invoice list.' });
  }

  const invoiceList = invoices.map(inv =>
    `• ${inv.invoice_number} - $${inv.amount} from ${inv.vendor} on ${inv.date}`
  ).join('\n');

  const emailContent = `Invoice Summary Report\n\nAI Summary (${tone} tone):\n${aiSummary}\n\nUploaded Invoices:\n${invoiceList}`;

  try {
    await sendMail({
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

const openai = require('../config/openrouter');
const { getTrainingSamples } = require('../utils/emailTrainer');

exports.smartDraftEmail = async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
  try {
    const samples = getTrainingSamples();
    const systemMsg = samples
      ? `Use the following past communications as style guidance:\n\n${samples}`
      : 'Use a friendly professional tone.';
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });
    const draft = completion.choices[0].message.content;
    res.json({ draft });
  } catch (err) {
    console.error('Smart draft error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate email draft' });
  }
};
