import React from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
  icon = <DocumentArrowUpIcon className="w-16 h-16 text-gray-400" />,
  headline = 'Let\u2019s get started!',
  description = 'Upload your first invoice to begin tracking spend, surfacing anomalies, and unlocking AI insights.',
  cta = 'Upload Invoice',
  onCta,
  children,
}) {
  return (
    <div className="relative">
      <img
        src="/logo512.png"
        alt="logo watermark"
        className="hidden sm:block absolute -z-10 bottom-0 right-0 w-32 opacity-10 pointer-events-none select-none"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500 py-10 flex flex-col items-center gap-2"
      >
        {icon}
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {headline}
        </h3>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
        {onCta && (
          <button
            onClick={onCta}
            className="mt-2 px-3 py-1 rounded bg-indigo-600 text-white text-sm transition-all duration-300 ease-in-out hover:bg-indigo-700"
          >
            {cta}
          </button>
        )}
        {children}
      </motion.div>
    </div>
  );
}
