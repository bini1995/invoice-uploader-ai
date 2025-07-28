import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentArrowUpIcon,
  DocumentIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

export default function ProblemSolutionSection() {
  const features = [
    { icon: DocumentArrowUpIcon, label: 'Auto Claims' },
    { icon: DocumentIcon, label: 'Property Claims' },
    { icon: DocumentMagnifyingGlassIcon, label: 'Health Claims' },
    { icon: ExclamationCircleIcon, label: 'Fraud Detection' },
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
          className="space-y-4"
        >
          <div className="text-3xl font-bold">
            Manual claims processing is slow, error-prone, and expensive.
          </div>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-red-500" />
              <span>Hours spent on manual data entry</span>
            </div>
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
              <span>Costly errors and processing delays</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldExclamationIcon className="w-5 h-5 text-red-500" />
              <span>Missed fraud detection opportunities</span>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h3 className="text-3xl font-bold">AI-powered claims extraction in seconds.</h3>
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
