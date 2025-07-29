import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import {
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const plans = [
  {
    id: 'usage',
    title: 'Pay As You Go',
    subtitle: '$0.25 per claim processed',
    price: 0.25,
    claims: 'per claim',
    summaries: 'Included',
    users: 'Unlimited',
    analytics: 'Basic',
    fraudDetection: false,
    cta: 'Start Processing',
  },
  {
    id: 'starter',
    title: 'Starter Plan',
    subtitle: '$199 for 1,000 claims',
    price: 199,
    claims: 1000,
    summaries: 'Unlimited',
    users: 5,
    analytics: 'Advanced',
    fraudDetection: true,
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'professional',
    title: 'Professional',
    subtitle: '$499 for 3,000 claims',
    price: 499,
    claims: 3000,
    summaries: 'Unlimited',
    users: 15,
    analytics: 'Advanced',
    fraudDetection: true,
    cta: 'Start Free Trial',
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const price = p => (p === 'Custom' ? p : annual ? p * 12 * 0.8 : p);
  useEffect(() => {
    const handle = () => {
      const bar = document.getElementById('sticky-cta');
      const pricing = document.getElementById('pricing');
      if (!bar || !pricing) return;
      const threshold = pricing.offsetTop - window.innerHeight / 2;
      bar.style.display = window.scrollY > threshold ? 'flex' : 'none';
    };
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);
  return (
    <section id="pricing" className="py-12 bg-gray-50 dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6">Pricing</h2>
      <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
        Simple, transparent pricing for insurance claims processing
      </p>
      <div className="flex justify-center mb-6 space-x-3 text-sm items-center">
        <span className={annual ? 'opacity-50' : 'font-semibold'}>Monthly</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={annual}
            onChange={() => setAnnual(v => !v)}
            aria-label="Toggle annual pricing"
          />
          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600"></div>
        </label>
        <span className={annual ? 'font-semibold' : 'opacity-50'}>Annual</span>
        {annual && (
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full ml-1">
            Save 20%
          </span>
        )}
      </div>
      <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
        {plans.map(plan => (
          <Card
            key={plan.id}
            id={plan.id}
            className={
              'text-center space-y-4 p-6 transform transition hover:scale-105 hover:shadow-xl ' +
              (plan.popular ? 'ring-2 ring-indigo-600' : '')
            }
          >
            {plan.popular && (
              <span className="inline-block bg-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow">Most Popular</span>
            )}
            <h3 className="text-xl font-semibold">{plan.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{plan.subtitle}</p>
            <p className="text-4xl font-bold">
              {typeof plan.price === 'number' ? `$${price(plan.price)}` : plan.price}
            </p>
            {typeof plan.price === 'number' && annual && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                billed annually • save ${plan.price * 12 * 0.2}/year
              </p>
            )}
            <ul className="text-sm space-y-1 text-left">
              <li className="flex items-center space-x-1">
                <CheckCircleIcon className="w-4 h-4" />
                <span className="font-semibold">{plan.claims}</span>{' '}claims/mo
              </li>
              <li className="flex items-center space-x-1">
                <UserGroupIcon className="w-4 h-4" />
                <span className="font-semibold">{plan.users}</span> users
              </li>
              <li className="flex items-center space-x-1">
                <SparklesIcon className="w-4 h-4" />
                <span className="font-semibold">{plan.summaries}</span> AI summaries
              </li>
              <li className="flex items-center space-x-1">
                <ChartBarIcon className="w-4 h-4" />
                <span className="font-semibold">{plan.analytics}</span>
                <span> analytics</span>
                <Tippy content="Claims processing dashboards and insights">
                  <span className="ml-1 cursor-help text-indigo-600">?</span>
                </Tippy>
              </li>
              {plan.fraudDetection && (
                <li className="flex items-center space-x-1">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Fraud Detection</span>
                  <Tippy content="AI-powered fraud detection and risk scoring">
                    <span className="ml-1 cursor-help text-indigo-600">?</span>
                  </Tippy>
                </li>
              )}
            </ul>
            <Button>{plan.cta}</Button>
            <div className="flex justify-center mt-2 gap-2 opacity-80">
              <img
                src="https://dummyimage.com/40x20/4b2ad3/ffffff.png&text=A"
                alt="Logo A"
                className="h-5 rounded"
              />
              <img
                src="https://dummyimage.com/40x20/4b2ad3/ffffff.png&text=B"
                alt="Logo B"
                className="h-5 rounded"
              />
            </div>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Need custom pricing for enterprise teams?
        </p>
        <Button variant="secondary">Contact Sales</Button>
      </div>
      <div id="sticky-cta" className="fixed bottom-0 inset-x-0 hidden justify-center bg-indigo-600 text-white p-4 z-40">
        <span className="mr-4 font-semibold">Ready to automate your claims processing?</span>
        <Button variant="secondary" className="bg-white text-indigo-600">Start Free Trial</Button>
      </div>
    </section>
  );
}
