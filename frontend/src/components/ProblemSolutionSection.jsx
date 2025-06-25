import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentArrowUpIcon,
  DocumentIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function ProblemSolutionSection() {
  const features = [
    { icon: DocumentArrowUpIcon, label: 'CSV' },
    { icon: DocumentIcon, label: 'PDF' },
    { icon: DocumentMagnifyingGlassIcon, label: 'OCR' },
    { icon: ExclamationCircleIcon, label: 'Error Checks' },
    { icon: ChartBarIcon, label: 'Real-time Analytics' },
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center px-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold"
        >
          You're spending hours on manual entry.
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h3 className="text-3xl font-bold">Upload once, let AI handle the rest.</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center space-y-1">
                <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
