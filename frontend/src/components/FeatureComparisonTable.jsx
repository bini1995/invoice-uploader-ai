import React from 'react';
import { Card } from './ui/Card';

const rows = [
  { label: 'Invoice Limit', starter: '500', growth: '2,500', pro: '10,000', enterprise: 'Unlimited' },
  { label: 'AI Summary Reports', starter: '1', growth: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Number of Users', starter: '1', growth: '3', pro: '10', enterprise: 'Custom' },
  { label: 'Smart Vendor Scoring', starter: '❌', growth: '✅', pro: '✅', enterprise: '✅' },
  { label: 'Slack/Email Alerts', starter: '❌', growth: '✅', pro: '✅', enterprise: '✅' },
  { label: 'Dedicated Manager', starter: '❌', growth: '❌', pro: '❌', enterprise: '✅' },
  { label: 'API Access', starter: '❌', growth: '✅', pro: '✅', enterprise: '✅' },
];

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
                <td className="px-4 py-2">{row.starter}</td>
                <td className="px-4 py-2">{row.growth}</td>
                <td className="px-4 py-2">{row.pro}</td>
                <td className="px-4 py-2">{row.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
