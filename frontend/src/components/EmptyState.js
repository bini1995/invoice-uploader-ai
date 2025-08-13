import React from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import CTAButton from './ui/CTAButton';

export default function EmptyState({
  icon = <DocumentArrowUpIcon className="w-16 h-16 text-gray-400" />,
  headline = 'Let\u2019s get started!',
  description = 'Upload your first document to begin tracking spend, surfacing anomalies, and unlocking AI insights.',
  cta = 'Upload Document',
  onCta,
  children,
}) {
  return (
    <div className="relative">
        <img
          src="/logo.svg"
          alt="ClarifyOps watermark"
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
          <CTAButton onClick={onCta} className="mt-2 text-sm px-3 py-1">
            {cta}
          </CTAButton>
        )}
        {children}
      </motion.div>
    </div>
  );
}
