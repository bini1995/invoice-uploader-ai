const pool = require('../config/db');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

module.exports = { createPaymentLink, stripeWebhook };
