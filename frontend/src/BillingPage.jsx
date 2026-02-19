import React, { useState, useEffect } from 'react';
import { API_BASE } from './api';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import {
  CreditCard, Check, ArrowRight, Shield, Zap, Building2,
  ExternalLink, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';

const FEATURES = [
  'AI field extraction (CPT, ICD-10, policy)',
  'Confidence scoring',
  'Duplicate detection',
  'Semantic search',
  'Medical chronology',
  'Webhook delivery & Zapier',
  'API access',
  'AuditFlow fraud scoring',
  'CSV & Excel exports',
  'HIPAA-ready infrastructure',
];

const VOLUME_DISCOUNTS = [
  { range: '1–25 claims/mo', price: 'Free', note: 'No credit card required' },
  { range: '26–499 claims/mo', price: '$4/claim', note: 'Pay only for what you use' },
  { range: '500–2,499 claims/mo', price: '$3.50/claim', note: 'Volume discount' },
  { range: '2,500+ claims/mo', price: 'Custom', note: 'Contact us for pricing' },
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);
  const [estimatedClaims, setEstimatedClaims] = useState(100);
  const token = localStorage.getItem('token');

  const urlParams = new URLSearchParams(window.location.search);
  const successParam = urlParams.get('success');
  const canceledParam = urlParams.get('canceled');

  useEffect(() => {
    if (successParam === 'true') {
      setStatusMsg({ type: 'success', text: 'Payment successful! Your account is now active.' });
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
      const subRes = await fetch(`${API_BASE}/api/stripe/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (subRes.ok) {
        const sd = await subRes.json();
        setSubscription(sd.subscription);
        setCurrentPlan(sd.plan || 'free');
      }
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
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

  function calculateMonthlyCost(claims) {
    if (claims <= 25) return 0;
    const billable = claims - 25;
    if (claims < 500) return billable * 4;
    return billable * 3.5;
  }

  const monthlyCost = calculateMonthlyCost(estimatedClaims);

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
    <ImprovedMainLayout title="Billing & Usage">
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Account</h2>
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
              Simple Per-Claim Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We handle the annoying prep work. You only pay for what you use &mdash; no subscriptions, no seat licenses, no annual contracts.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 p-8 text-center mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
              Pay As You Go
            </div>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">$4</span>
              <span className="text-gray-500 dark:text-gray-400 text-lg">/claim</span>
            </div>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-1">First 25 claims free every month</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Volume discounts available for 500+ claims/month</p>

            <div className="max-w-md mx-auto mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimate your monthly cost</label>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{estimatedClaims.toLocaleString()} claims</span>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="25"
                value={estimatedClaims}
                onChange={(e) => setEstimatedClaims(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>2,500</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {monthlyCost === 0 ? 'Free' : `$${monthlyCost.toLocaleString()}/mo`}
              </div>
              {estimatedClaims <= 25 && estimatedClaims > 0 && (
                <p className="text-xs text-emerald-600 mt-1">Covered by your free monthly allowance</p>
              )}
            </div>

            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Free &mdash; No Credit Card Required
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                Volume Pricing
              </h3>
              <div className="space-y-3">
                {VOLUME_DISCOUNTS.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{tier.range}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tier.note}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{tier.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Everything Included
              </h3>
              <ul className="space-y-2">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">How does per-claim billing work?</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                You get 25 free claims every month. After that, each claim costs $4. If you process 500+ claims/month, volume discounts apply automatically. No subscriptions, no contracts.
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
                Yes! Your first 25 claims every month are free, forever. No credit card required to get started.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Are there any contracts or commitments?</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                No. Pay-as-you-go means exactly that. Use it when you need it, stop when you don't. No annual contracts, no cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ImprovedMainLayout>
  );
}
