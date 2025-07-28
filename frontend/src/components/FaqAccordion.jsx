import React, { useState } from 'react';
import { Card } from './ui/Card';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

const faqs = [
  {
    q: 'What types of insurance claims can you process?',
    a: 'We can process auto, property, health, workers compensation, and general liability claims. Our AI extracts data from PDFs, images, scanned documents, and handwritten forms.',
  },
  {
    q: 'How accurate is the AI claims extraction?',
    a: 'Our AI achieves 95%+ accuracy on structured claims data. We provide confidence scores and human review workflows for any uncertain extractions.',
  },
  {
    q: 'Can I integrate with my existing claims management system?',
    a: 'Yes! We offer API integrations, webhooks, and export options to connect with your existing claims processing workflow and databases.',
  },
  {
    q: 'What happens after the free trial?',
    a: 'You can choose a paid plan based on your claims volume, or continue with a limited free tier for testing and small-scale processing.',
  },
  {
    q: 'Do you offer fraud detection features?',
    a: 'Yes, our AI includes built-in fraud detection that flags suspicious patterns, duplicate claims, and potential red flags for manual review.',
  },
  {
    q: 'How quickly can I start processing claims?',
    a: 'You can start processing claims within minutes. No setup required - just upload your first claim document and see results instantly.',
  },
  {
    q: 'What about data security and compliance?',
    a: 'We\'re SOC 2 compliant with end-to-end encryption. All data is processed securely and we maintain strict compliance with insurance industry regulations.',
  },
  {
    q: 'Can I cancel or change plans anytime?',
    a: 'Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings.',
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
      <p className="text-center mb-8 text-gray-600 dark:text-gray-300">
        Everything you need to know about AI Claims Data Extraction
      </p>
      <div className="container mx-auto max-w-3xl px-6 space-y-2">
        {faqs.map((f, idx) => (
          <Card
            key={idx}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-left">{f.q}</span>
              {open === idx ? (
                <MinusIcon className="w-5 h-5 flex-shrink-0" />
              ) : (
                <PlusIcon className="w-5 h-5 flex-shrink-0" />
              )}
            </div>
            <AnimatePresence initial={false}>
              {open === idx && (
                <motion.p
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 text-sm text-gray-600 dark:text-gray-300 overflow-hidden"
                >
                  {f.a}
                </motion.p>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </section>
  );
}
