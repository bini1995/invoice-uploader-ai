import { getUncachableStripeClient } from './stripeClient.js';
import pool from '../config/db.js';

export async function createStripeCustomer(email, userId, name) {
  const stripe = await getUncachableStripeClient();
  return await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId: String(userId), platform: 'clarifyops' },
  });
}

export async function createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
  const stripe = await getUncachableStripeClient();
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });
}

export async function createCustomerPortalSession(customerId, returnUrl) {
  const stripe = await getUncachableStripeClient();
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getProductsWithPrices() {
  const result = await pool.query(`
    SELECT 
      p.id as product_id,
      p.name as product_name,
      p.description as product_description,
      p.active as product_active,
      p.metadata as product_metadata,
      pr.id as price_id,
      pr.unit_amount,
      pr.currency,
      pr.recurring,
      pr.active as price_active,
      pr.metadata as price_metadata
    FROM stripe.products p
    LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
    WHERE p.active = true
    ORDER BY p.metadata->>'sort_order', pr.unit_amount
  `);

  const productsMap = new Map();
  for (const row of result.rows) {
    if (!productsMap.has(row.product_id)) {
      productsMap.set(row.product_id, {
        id: row.product_id,
        name: row.product_name,
        description: row.product_description,
        active: row.product_active,
        metadata: row.product_metadata,
        prices: []
      });
    }
    if (row.price_id) {
      productsMap.get(row.product_id).prices.push({
        id: row.price_id,
        unit_amount: row.unit_amount,
        currency: row.currency,
        recurring: row.recurring,
        active: row.price_active,
        metadata: row.price_metadata,
      });
    }
  }

  return Array.from(productsMap.values());
}

export async function getSubscriptionForCustomer(customerId) {
  const result = await pool.query(
    `SELECT * FROM stripe.subscriptions WHERE customer = $1 AND status IN ('active', 'trialing') LIMIT 1`,
    [customerId]
  );
  return result.rows[0] || null;
}

export async function getUserStripeInfo(userId) {
  const result = await pool.query(
    `SELECT stripe_customer_id, stripe_subscription_id FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

export async function updateUserStripeInfo(userId, stripeCustomerId, stripeSubscriptionId) {
  const sets = [];
  const vals = [];
  let idx = 1;
  if (stripeCustomerId !== undefined) {
    sets.push(`stripe_customer_id = $${idx++}`);
    vals.push(stripeCustomerId);
  }
  if (stripeSubscriptionId !== undefined) {
    sets.push(`stripe_subscription_id = $${idx++}`);
    vals.push(stripeSubscriptionId);
  }
  if (sets.length === 0) return;
  vals.push(userId);
  await pool.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}`,
    vals
  );
}
