import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const plans = [
  {
    id: 'starter',
    title: 'Starter',
    subtitle: 'For solo users getting started',
    price: 49,
    invoices: 500,
    summaries: 1,
    users: 1,
    cta: 'Start free — no credit card',
  },
  {
    id: 'growth',
    title: 'Growth',
    subtitle: 'For growing finance teams',
    price: 149,
    invoices: 2500,
    summaries: 'Unlimited',
    users: 3,
    cta: 'Start free for 14 days',
    popular: true,
  },
  {
    id: 'pro',
    title: 'Pro',
    subtitle: 'For scaling ops',
    price: 399,
    invoices: 10000,
    summaries: 'Unlimited',
    users: 10,
    cta: 'Schedule Demo',
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const price = p => (p === 'Custom' ? p : annual ? p * 12 * 0.8 : p);
  useEffect(() => {
    const handle = () => {
      const bar = document.getElementById('sticky-cta');
      if (!bar) return;
      bar.style.display = window.scrollY > 400 ? 'flex' : 'none';
    };
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);
  return (
    <section id="pricing" className="py-12 bg-gray-50 dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6">Pricing</h2>
      <div className="flex justify-center mb-6 space-x-2 text-sm">
        <span className={annual ? 'opacity-50' : 'font-semibold'}>Monthly</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={annual}
            onChange={() => setAnnual(v => !v)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600"></div>
        </label>
        <span className={annual ? 'font-semibold' : 'opacity-50'}>
          Annual <span className="text-indigo-600">(save 20%)</span>
        </span>
      </div>
      <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
        {plans.map(plan => (
          <Card
            key={plan.id}
            className={
              'text-center space-y-4 p-6 transform transition hover:scale-105 hover:shadow-xl ' +
              (plan.popular ? 'ring-2 ring-indigo-600' : '')
            }
          >
            {plan.popular && (
              <span className="text-xs uppercase tracking-wide text-indigo-600">Most Popular</span>
            )}
            <h3 className="text-xl font-semibold">{plan.title}</h3>
            <p className="text-sm text-gray-500">{plan.subtitle}</p>
            <p className="text-4xl font-bold">
              {typeof plan.price === 'number' ? `$${price(plan.price)}` : plan.price}
            </p>
            {typeof plan.price === 'number' && annual && (
              <p className="text-xs text-gray-500">billed annually</p>
            )}
            <ul className="text-sm space-y-1 text-left">
              <li className="flex items-center space-x-1">
                <CheckCircleIcon className="w-4 h-4" />
                <span className="font-semibold">{plan.invoices}</span>{' '}invoices/mo
              </li>
              <li className="flex items-center space-x-1">
                <UserGroupIcon className="w-4 h-4" />
                <span className="font-semibold">{plan.users}</span> users
              </li>
              <li className="flex items-center space-x-1">
                <SparklesIcon className="w-4 h-4" />
                <span className="font-semibold">{plan.summaries}</span> AI summary
              </li>
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
      <div id="sticky-cta" className="fixed bottom-0 inset-x-0 hidden justify-center bg-indigo-600 text-white p-4 z-40">
        <span className="mr-4 font-semibold">Ready to get started?</span>
        <Button variant="secondary" className="bg-white text-indigo-600">Start Free Trial</Button>
      </div>
    </section>
  );
}
