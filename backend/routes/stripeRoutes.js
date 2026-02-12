import { Router } from 'express';
import { getStripePublishableKey } from '../stripe/stripeClient.js';
import {
  createStripeCustomer,
  createCheckoutSession,
  createCustomerPortalSession,
  getProductsWithPrices,
  getSubscriptionForCustomer,
  getUserStripeInfo,
  updateUserStripeInfo,
} from '../stripe/stripeService.js';
import { authMiddleware } from '../controllers/userController.js';
import pool from '../config/db.js';

const router = Router();

router.use(authMiddleware);

router.get('/config', async (req, res) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (err) {
    console.error('Stripe config error:', err);
    res.status(500).json({ error: 'Failed to get Stripe config' });
  }
});

const FALLBACK_PRODUCTS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started with AI claims processing.',
    active: true,
    metadata: { tier: 'starter' },
    prices: [
      { id: 'starter_monthly', unit_amount: 24900, currency: 'usd', recurring: { interval: 'month' }, active: true },
      { id: 'starter_yearly', unit_amount: 239000, currency: 'usd', recurring: { interval: 'year' }, active: true },
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams that need advanced analytics and integrations.',
    active: true,
    metadata: { tier: 'professional' },
    prices: [
      { id: 'pro_monthly', unit_amount: 49900, currency: 'usd', recurring: { interval: 'month' }, active: true },
      { id: 'pro_yearly', unit_amount: 479000, currency: 'usd', recurring: { interval: 'year' }, active: true },
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs and compliance requirements.',
    active: true,
    metadata: { tier: 'enterprise' },
    prices: [
      { id: 'ent_monthly', unit_amount: 99900, currency: 'usd', recurring: { interval: 'month' }, active: true },
      { id: 'ent_yearly', unit_amount: 959000, currency: 'usd', recurring: { interval: 'year' }, active: true },
    ]
  }
];

router.get('/products', async (req, res) => {
  try {
    const products = await getProductsWithPrices();
    if (products && products.length > 0) {
      res.json({ data: products });
    } else {
      res.json({ data: FALLBACK_PRODUCTS, fallback: true });
    }
  } catch (err) {
    console.error('Products fetch error (using fallback):', err.message);
    res.json({ data: FALLBACK_PRODUCTS, fallback: true });
  }
});

router.get('/subscription', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const stripeInfo = await getUserStripeInfo(userId);
    if (!stripeInfo?.stripe_customer_id) {
      return res.json({ subscription: null, plan: 'free' });
    }

    const subscription = await getSubscriptionForCustomer(stripeInfo.stripe_customer_id);
    if (!subscription) {
      return res.json({ subscription: null, plan: 'free' });
    }

    let productName = 'Unknown';
    try {
      const itemResult = await pool.query(
        `SELECT si.price, pr.product, p.name as product_name, pr.unit_amount
         FROM stripe.subscription_items si
         JOIN stripe.prices pr ON pr.id = si.price
         JOIN stripe.products p ON p.id = pr.product
         WHERE si.subscription = $1 LIMIT 1`,
        [subscription.id]
      );
      if (itemResult.rows[0]) {
        productName = itemResult.rows[0].product_name;
      }
    } catch (e) {}

    res.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        plan: productName,
      },
      plan: productName.toLowerCase().replace(/\s+/g, '_'),
    });
  } catch (err) {
    console.error('Subscription fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { priceId } = req.body;
    if (!priceId) return res.status(400).json({ error: 'Price ID required' });

    const userResult = await pool.query(
      'SELECT id, email, name, stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await createStripeCustomer(user.email, user.id, user.name);
      await updateUserStripeInfo(userId, customer.id);
      customerId = customer.id;
    }

    const baseUrl = `https://${req.get('host')}`;
    const session = await createCheckoutSession(
      customerId,
      priceId,
      `${baseUrl}/billing?success=true`,
      `${baseUrl}/billing?canceled=true`
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/portal', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const stripeInfo = await getUserStripeInfo(userId);
    if (!stripeInfo?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const baseUrl = `https://${req.get('host')}`;
    const session = await createCustomerPortalSession(
      stripeInfo.stripe_customer_id,
      `${baseUrl}/billing`
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;
