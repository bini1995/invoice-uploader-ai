import React from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ message = 'No invoices yet. Upload your first file to get started!', onCta, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center text-gray-500 italic py-10 flex flex-col items-center gap-2"
    >
      <DocumentArrowUpIcon className="w-16 h-16 text-gray-400" />
      <p>{message}</p>
      {onCta && (
        <button
          onClick={onCta}
          className="mt-2 px-3 py-1 rounded bg-indigo-600 text-white text-sm transition-all duration-300 ease-in-out hover:bg-indigo-700"
        >
          Upload Invoice
        </button>
      )}
      {children}
    </motion.div>
  );
}
