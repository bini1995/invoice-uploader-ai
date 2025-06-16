const pool = require('../config/db');
const axios = require('axios');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendSlackNotification } = require('../utils/notify');

async function createPaymentLink(req, res) {
  const { id } = req.params;
  const { method, successUrl, cancelUrl } = req.body;
  try {
    const result = await pool.query('SELECT invoice_number, amount FROM invoices WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const invoice = result.rows[0];
    let link; let provider;
    if (method === 'paypal') {
      const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
      const tokenRes = await axios.post('https://api-m.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
        headers: { Authorization: `Basic ${auth}` },
      });
      const access = tokenRes.data.access_token;
      const orderRes = await axios.post('https://api-m.paypal.com/v2/checkout/orders', {
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: invoice.amount } }],
        application_context: { return_url: successUrl, cancel_url: cancelUrl },
      }, { headers: { Authorization: `Bearer ${access}` } });
      const approve = orderRes.data.links.find(l => l.rel === 'approve');
      link = approve.href;
      provider = 'PayPal';
    } else {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: method === 'ach' ? ['us_bank_account'] : ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `Invoice ${invoice.invoice_number}` },
            unit_amount: Math.round(Number(invoice.amount) * 100),
          },
          quantity: 1,
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      link = session.url;
      provider = 'Stripe';
    }
    await pool.query('UPDATE invoices SET payment_link = $1, payment_status = $2 WHERE id = $3', [link, 'Pending', id]);
    res.json({ paymentLink: link, provider });
  } catch (err) {
    console.error('Payment link error:', err);
    res.status(500).json({ message: 'Failed to create payment link' });
  }
}

async function stripeWebhook(req, res) {
  const event = req.body;
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      await pool.query('UPDATE invoices SET payment_status = $1 WHERE payment_link = $2', ['Paid', session.url]);
    } catch (err) {
      console.error('Webhook update error:', err);
    }
  }
  res.json({ received: true });
}

async function processFailedPayments() {
  try {
    const now = new Date();
    const { rows } = await pool.query(
      "SELECT id, amount, retry_count, next_retry, late_fee FROM invoices WHERE payment_status = 'Failed'"
    );
    for (const inv of rows) {
      if (inv.next_retry && new Date(inv.next_retry) > now) continue;
      if (inv.retry_count < 3) {
        await pool.query(
          "UPDATE invoices SET retry_count = retry_count + 1, next_retry = $1, payment_status = 'Retrying' WHERE id = $2",
          [new Date(now.getTime() + 24 * 60 * 60 * 1000), inv.id]
        );
        await sendSlackNotification?.(`Retrying payment for invoice ${inv.id} (attempt ${inv.retry_count + 1})`);
      } else if (parseFloat(inv.late_fee) === 0) {
        const fee = Number(inv.amount) * 0.02;
        await pool.query(
          'UPDATE invoices SET late_fee = $1, amount = amount + $1 WHERE id = $2',
          [fee, inv.id]
        );
        await sendSlackNotification?.(`Late fee applied to invoice ${inv.id}`);
      }
    }
  } catch (err) {
    console.error('Payment retry error:', err);
  }
}

async function sendPaymentReminders() {
  try {
    const now = new Date();
    const upcoming = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const { rows } = await pool.query(
      `SELECT id, invoice_number, vendor, due_date, amount
       FROM invoices
       WHERE payment_status != 'Paid'
         AND due_date IS NOT NULL
         AND due_date <= $1`,
      [upcoming]
    );
    if (!rows.length) return;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const inv of rows) {
      const overdue = new Date(inv.due_date) < now;
      const subject = overdue
        ? `Overdue invoice ${inv.invoice_number}`
        : `Invoice ${inv.invoice_number} due soon`;
      const text = overdue
        ? `Invoice ${inv.invoice_number} from ${inv.vendor} for $${inv.amount} was due on ${inv.due_date} and remains unpaid.`
        : `Invoice ${inv.invoice_number} from ${inv.vendor} for $${inv.amount} is due on ${inv.due_date}.`;
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_TO,
          subject,
          text,
        });
        await sendSlackNotification?.(`Payment reminder sent: ${subject}`);
      } catch (err) {
        console.error('Reminder email error:', err);
      }
    }
  } catch (err) {
    console.error('Payment reminder error:', err);
  }
}

module.exports = {
  createPaymentLink,
  stripeWebhook,
  processFailedPayments,
  sendPaymentReminders,
};
