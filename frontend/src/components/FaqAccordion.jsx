import React, { useState } from 'react';
import { Card } from './ui/Card';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    q: 'What happens after the free trial?',
    a: 'You can pick a paid plan or keep using the limited free tier.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Your subscription will stop at the end of the current period.',
  },
  {
    q: 'Do you offer annual billing discounts?',
    a: 'Absolutely—switch to annual to save 20%.',
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6">FAQ</h2>
      <div className="container mx-auto max-w-2xl px-6 space-y-2">
        {faqs.map((f, idx) => (
          <Card key={idx} className="p-4 cursor-pointer" onClick={() => setOpen(open === idx ? null : idx)}>
            <div className="flex justify-between items-center">
              <span className="font-medium">{f.q}</span>
              <ChevronDownIcon className={`w-5 h-5 transform transition ${open === idx ? 'rotate-180' : ''}`} />
            </div>
            {open === idx && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{f.a}</p>}
          </Card>
        ))}
      </div>
    </section>
  );
}
