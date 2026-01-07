
import openai from '../config/openrouter.js';
import { sendMail } from '../utils/email.js';
import pool from '../config/db.js';
import settings from '../config/settings.js';
import 'dotenv/config';
/**
 * Generate a polite vendor notification email draft when an invoice is flagged or rejected.
 * If `manualEdit` is provided in the request body the email will be sent directly
 * to the specified vendor email address instead of returning a draft.
 */
export const vendorReply = async (req, res) => {
  const { id } = req.params;
  const { status, reason, manualEdit, email } = req.body;

  if (!status || !['flagged', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be flagged or rejected.' });
  }

  try {
    const result = await pool.query(
      'SELECT invoice_number, vendor, amount, date, flag_reason FROM invoices WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const inv = result.rows[0];

    const why = reason || inv.flag_reason || '';

    // If manualEdit is provided, send the email using that text
    if (manualEdit) {
      if (!email) {
        return res.status(400).json({ message: 'Vendor email required to send.' });
      }
      await sendMail({
        to: email,
        subject: `Regarding Invoice ${inv.invoice_number}`,
        text: manualEdit,
      });
      return res.json({ message: 'Email sent successfully.' });
    }

    const tone = (req.body.tone || settings.emailTone || 'professional').toLowerCase();
    const toneMap = {
      friendly: 'friendly',
      assertive: 'assertive',
      formal: 'formal',
      casual: 'casual',
      professional: 'professional',
    };
    const toneText = toneMap[tone] || 'professional';
    const prompt = `Write a short, ${toneText} email to vendor ${inv.vendor} letting them know their invoice number ${inv.invoice_number} dated ${inv.date.toISOString().split('T')[0]} for $${inv.amount} was ${status}. Reason: ${why}. Offer guidance on how to correct and resubmit.`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const draft = completion.choices[0].message.content;
    res.json({ draft });
  } catch (err) {
    console.error('Vendor reply error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate vendor reply.' });
  }
};
