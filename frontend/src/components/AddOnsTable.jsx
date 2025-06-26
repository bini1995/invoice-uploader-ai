import React from 'react';
import { Card } from './ui/Card';

const addOns = [
  { feature: '+1,000 invoices', price: '$10', best: 'High-volume months' },
  { feature: 'Extra team member', price: '$5/user', best: 'Adding finance or AI support' },
  { feature: 'Slack/Email alerts', price: '$20', best: 'Real-time ops workflows' },
  { feature: 'Dedicated tenant setup', price: '$50', best: 'Enterprises & white-label clients' },
  { feature: 'Smart vendor scoring', price: '$100', best: 'Vendor prioritization & risk reduction' },
];

export default function AddOnsTable() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-6">Optional Add-Ons</h2>
      <div className="container mx-auto overflow-x-auto px-6">
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b px-4 py-2">Add-On Feature</th>
                <th className="border-b px-4 py-2">Monthly Price</th>
                <th className="border-b px-4 py-2">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {addOns.map(a => (
                <tr key={a.feature}>
                  <td className="px-4 py-2">{a.feature}</td>
                  <td className="px-4 py-2">{a.price}</td>
                  <td className="px-4 py-2">{a.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}
