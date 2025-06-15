const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(req, res) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: req.body.priceId, quantity: 1 }],
      success_url: req.body.successUrl,
      cancel_url: req.body.cancelUrl
    });
    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe error', err);
    res.status(500).json({ error: 'Stripe session failed' });
  }
}

module.exports = { createCheckoutSession };
