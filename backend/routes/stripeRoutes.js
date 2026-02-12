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

router.get('/products', async (req, res) => {
  try {
    const products = await getProductsWithPrices();
    res.json({ data: products });
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
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
