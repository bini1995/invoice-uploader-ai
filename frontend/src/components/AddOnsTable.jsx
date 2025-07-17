import React from 'react';
import { Card } from './ui/Card';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import {
  PlusCircleIcon,
  UserPlusIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const addOns = [
  {
    feature: '+1,000 invoices',
    price: '$10',
    best: 'High-volume months',
    icon: PlusCircleIcon,
    color: 'text-green-600',
  },
  {
    feature: 'Extra team member',
    price: '$5/user',
    best: 'Adding finance or AI support',
    icon: UserPlusIcon,
    color: 'text-blue-600',
  },
  {
    feature: 'Slack/Email alerts',
    price: '$20',
    best: 'Real-time ops workflows',
    icon: EnvelopeIcon,
    color: 'text-indigo-600',
  },
  {
    feature: 'Dedicated tenant setup',
    price: '$50',
    best: 'Enterprises & white-label clients',
    icon: BuildingOffice2Icon,
    color: 'text-yellow-600',
  },
  {
    feature: 'Smart vendor scoring',
    price: '$100',
    best: 'Vendor prioritization & risk reduction',
    icon: SparklesIcon,
    color: 'text-pink-600',
  },
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
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <a.icon className={`w-5 h-5 mr-1 ${a.color}`} />
                      <span>{a.feature}</span>
                      <Tippy content="Not included in your current plan">
                        <ExclamationCircleIcon className="w-4 h-4 text-yellow-500 ml-1" />
                      </Tippy>
                    </div>
                  </td>
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
