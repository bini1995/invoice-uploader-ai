import { getUncachableStripeClient } from './stripeClient.js';

const PLANS = [
  {
    name: 'Starter',
    description: 'Perfect for small agencies and independent adjusters. Process up to 200 claims/month with core AI extraction, confidence scoring, and basic exports.',
    metadata: { sort_order: '1', tier: 'starter', claims_limit: '200' },
    monthlyPrice: 9900,
    yearlyPrice: 95000,
  },
  {
    name: 'Professional',
    description: 'For growing teams. Up to 1,000 claims/month with advanced features: duplicate detection, semantic search, medical chronology, webhook delivery, and priority support.',
    metadata: { sort_order: '2', tier: 'professional', claims_limit: '1000' },
    monthlyPrice: 19900,
    yearlyPrice: 191000,
  },
  {
    name: 'Enterprise',
    description: 'Unlimited claims with full platform access: custom integrations, API access, dedicated account manager, SLA guarantees, and HIPAA BAA.',
    metadata: { sort_order: '3', tier: 'enterprise', claims_limit: 'unlimited' },
    monthlyPrice: 29900,
    yearlyPrice: 287000,
  },
];

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  for (const plan of PLANS) {
    const existing = await stripe.products.search({ query: `name:'${plan.name}'` });
    if (existing.data.length > 0) {
      console.log(`✅ ${plan.name} already exists (${existing.data[0].id})`);
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: plan.metadata,
    });
    console.log(`Created product: ${product.id} (${plan.name})`);

    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.monthlyPrice,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { billing_period: 'monthly' },
    });
    console.log(`  Monthly price: ${monthly.id} ($${(plan.monthlyPrice / 100).toFixed(2)}/mo)`);

    const yearly = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.yearlyPrice,
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { billing_period: 'yearly' },
    });
    console.log(`  Yearly price: ${yearly.id} ($${(plan.yearlyPrice / 100).toFixed(2)}/yr)`);
  }

  console.log('\n✅ All products seeded successfully!');
}

seedProducts().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
