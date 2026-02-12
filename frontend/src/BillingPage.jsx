import React, { useState, useEffect } from 'react';
import { API_BASE } from './api';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import {
  CreditCard, Check, ArrowRight, Shield, Zap, Building2,
  ExternalLink, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';

const PLAN_FEATURES = {
  starter: [
    'Up to 500 claims/month',
    'AI field extraction (CPT, ICD-10, policy)',
    'Confidence scoring',
    'CSV & Excel exports',
    'Email support',
    'HIPAA-ready infrastructure',
  ],
  professional: [
    'Up to 2,500 claims/month',
    'Everything in Starter, plus:',
    'Duplicate detection',
    'Semantic search',
    'Medical chronology',
    'Webhook delivery & Zapier',
    'API access',
    'Priority support',
    'AuditFlow fraud scoring',
  ],
  enterprise: [
    'Up to 10,000 claims/month',
    'Everything in Professional, plus:',
    'Custom workflow rules',
    'Dedicated onboarding',
    'Custom AI model tuning',
    'SLA guarantees',
    'HIPAA BAA included',
    'Multi-tenant setup',
  ],
};

const PLAN_ICONS = {
  Starter: Zap,
  Professional: Shield,
  Enterprise: Building2,
};

const FALLBACK_PRODUCTS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started with AI claims processing.',
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
    metadata: { tier: 'enterprise' },
    prices: [
      { id: 'ent_monthly', unit_amount: 99900, currency: 'usd', recurring: { interval: 'month' }, active: true },
      { id: 'ent_yearly', unit_amount: 959000, currency: 'usd', recurring: { interval: 'year' }, active: true },
    ]
  }
];

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [statusMsg, setStatusMsg] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const token = localStorage.getItem('token');

  const urlParams = new URLSearchParams(window.location.search);
  const successParam = urlParams.get('success');
  const canceledParam = urlParams.get('canceled');

  useEffect(() => {
    if (successParam === 'true') {
      setStatusMsg({ type: 'success', text: 'Payment successful! Your subscription is now active.' });
      window.history.replaceState({}, '', '/billing');
    } else if (canceledParam === 'true') {
      setStatusMsg({ type: 'info', text: 'Checkout was canceled. No charges were made.' });
      window.history.replaceState({}, '', '/billing');
    }
  }, [successParam, canceledParam]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/api/stripe/products`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/stripe/subscription`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      let loadedProducts = [];
      if (productsRes.ok) {
        const pd = await productsRes.json();
        loadedProducts = pd.data || [];
      }

      if (loadedProducts.length === 0) {
        setProducts(FALLBACK_PRODUCTS);
        setUseFallback(true);
      } else {
        setProducts(loadedProducts);
        setUseFallback(false);
      }

      if (subRes.ok) {
        const sd = await subRes.json();
        setSubscription(sd.subscription);
        setCurrentPlan(sd.plan || 'free');
      }
    } catch (err) {
      console.error('Failed to load billing data:', err);
      setProducts(FALLBACK_PRODUCTS);
      setUseFallback(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(priceId) {
    if (useFallback) {
      window.location.href = 'mailto:sales@clarifyops.com?subject=ClarifyOps%20Subscription%20Inquiry';
      return;
    }
    setCheckoutLoading(priceId);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ priceId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to start checkout' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to start checkout. Please try again.' });
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleManageBilling() {
    try {
      const res = await fetch(`${API_BASE}/api/stripe/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to open billing portal.' });
    }
  }

  function getPrice(product, period) {
    const prices = product.prices || [];
    return prices.find(p => {
      const rec = p.recurring;
      if (!rec) return false;
      const interval = typeof rec === 'string' ? JSON.parse(rec)?.interval : rec?.interval;
      return period === 'yearly' ? interval === 'year' : interval === 'month';
    });
  }

  function formatAmount(cents) {
    return `$${(cents / 100).toFixed(0)}`;
  }

  const tier = (product) => (product.metadata?.tier || product.name?.toLowerCase() || '');

  if (loading) {
    return (
      <ImprovedMainLayout title="Billing">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading billing information...</span>
        </div>
      </ImprovedMainLayout>
    );
  }

  return (
    <ImprovedMainLayout title="Billing & Subscription">
      <div className="max-w-5xl mx-auto space-y-8">
        {statusMsg && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            statusMsg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' :
            statusMsg.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300' :
            'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
             statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> :
             <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {subscription && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Subscription</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{subscription.plan}</span>
                  {' '}&mdash;{' '}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {subscription.status}
                  </span>
                </p>
                {subscription.current_period_end && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {subscription.cancel_at_period_end
                      ? `Cancels on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`
                      : `Renews on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`}
                  </p>
                )}
              </div>
              <button
                onClick={handleManageBilling}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {subscription ? 'Change Your Plan' : 'Choose Your Plan'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Select the plan that fits your claims processing needs
            </p>
            <div className="mt-4 inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Yearly <span className="text-green-600 dark:text-green-400 text-xs ml-1">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => {
              const t = tier(product);
              const price = getPrice(product, billingPeriod);
              const Icon = PLAN_ICONS[product.name] || Zap;
              const features = PLAN_FEATURES[t] || [];
              const isCurrentPlan = currentPlan === t;
              const isPopular = t === 'professional';

              return (
                <div
                  key={product.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 flex flex-col ${
                    isPopular
                      ? 'border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      isPopular ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isPopular ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                  </div>

                  <div className="mb-4">
                    {price ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatAmount(price.unit_amount)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          /{billingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Contact us for pricing</span>
                    )}
                    {billingPeriod === 'yearly' && price && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {formatAmount(Math.round(price.unit_amount / 12))}/mo billed annually
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {product.description}
                  </p>

                  <ul className="space-y-2 mb-6 flex-grow">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : price ? (
                    <button
                      onClick={() => handleCheckout(price.id)}
                      disabled={checkoutLoading === price.id}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        isPopular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                      } disabled:opacity-50`}
                    >
                      {checkoutLoading === price.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {subscription ? 'Switch Plan' : 'Get Started'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = 'mailto:sales@clarifyops.com'}
                      className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 transition-colors"
                    >
                      Contact Sales
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Plans are being configured. Please check back shortly.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Can I change plans anytime?</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Yes! You can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate any difference.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">What payment methods are accepted?</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                We accept all major credit cards, debit cards, Apple Pay, and Google Pay through our secure payment processor (Stripe).
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Is there a free trial?</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Yes! You can try ClarifyOps free with up to 50 claims/month. No credit card required to get started.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">How do I cancel?</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                You can cancel anytime from the billing portal. Your access continues until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ImprovedMainLayout>
  );
}
