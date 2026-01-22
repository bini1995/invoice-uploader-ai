import React from 'react';
import { Card } from './ui/Card';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const rows = [
  { label: 'Invoice Limit', starter: '500', growth: '2,500', pro: '10,000', enterprise: 'Unlimited' },
  { label: 'AI Summary Reports', starter: '1', growth: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Number of Users', starter: '1', growth: '3', pro: '10', enterprise: 'Custom' },
  { label: 'Smart Vendor Scoring', starter: '❌', growth: '✅', pro: '✅', enterprise: '✅' },
  { label: 'Slack/Email Alerts', starter: '❌', growth: '✅', pro: '✅', enterprise: '✅' },
  { label: 'Dedicated Manager', starter: '❌', growth: '❌', pro: '❌', enterprise: '✅' },
  { label: 'API Access', starter: '❌', growth: '✅', pro: '✅', enterprise: '✅' },
];

const planOrder = ['starter', 'growth', 'pro', 'enterprise'];
const upgradeText = plan =>
  plan === 'growth' ? 'Get this with Growth' : `Unlock in ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;

export default function FeatureComparisonTable() {
  return (
    <div className="container mx-auto overflow-x-auto px-6 mt-8">
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr>
              <th className="border-b px-4 py-2 text-left">Feature</th>
              <th className="border-b px-4 py-2">Starter</th>
              <th className="border-b px-4 py-2">Growth</th>
              <th className="border-b px-4 py-2">Pro</th>
              <th className="border-b px-4 py-2">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(row => (
              <tr key={row.label}>
                <td className="px-4 py-2 text-left">{row.label}</td>
                {planOrder.map(plan => {
                  const value = row[plan];
                  if (value === '✅') {
                    return (
                      <td key={plan} className="px-4 py-2">
                        <CheckCircleIcon className="w-5 h-5 mx-auto text-green-500" />
                      </td>
                    );
                  }
                  if (value === '❌') {
                    const currentIndex = planOrder.indexOf(plan);
                    const nextPlan = planOrder.slice(currentIndex + 1).find(p => row[p] !== '❌');
                    return (
                      <td key={plan} className="px-4 py-2">
                        <div className="flex flex-col items-center space-y-1">
                          <Tippy content="Available with upgrade">
                            <XMarkIcon className="w-5 h-5 text-gray-300" />
                          </Tippy>
                          {nextPlan && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded-full">
                              {upgradeText(nextPlan)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td key={plan} className="px-4 py-2">{value}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
