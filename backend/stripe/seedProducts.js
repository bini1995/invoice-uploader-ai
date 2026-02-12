import { getUncachableStripeClient } from './stripeClient.js';

const PLANS = [
  {
    name: 'Starter',
    description: 'For small TPAs and independent adjusters. Up to 500 claims/month with AI extraction, confidence scoring, CSV/Excel exports, and email support.',
    metadata: { sort_order: '1', tier: 'starter', claims_limit: '500' },
    monthlyPrice: 24900,
    yearlyPrice: 238800,
  },
  {
    name: 'Professional',
    description: 'For operations teams ready to scale. Up to 2,500 claims/month with duplicate detection, semantic search, medical chronology, webhooks, API access, and priority support.',
    metadata: { sort_order: '2', tier: 'professional', claims_limit: '2500' },
    monthlyPrice: 49900,
    yearlyPrice: 479000,
  },
  {
    name: 'Enterprise',
    description: 'For carriers and large TPAs. Up to 10,000 claims/month with custom workflows, dedicated onboarding, custom AI tuning, SLA guarantees, and HIPAA BAA.',
    metadata: { sort_order: '3', tier: 'enterprise', claims_limit: '10000' },
    monthlyPrice: 99900,
    yearlyPrice: 959000,
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
