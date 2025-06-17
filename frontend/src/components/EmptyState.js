import React from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ message = 'No invoices yet. Upload your first file to get started!' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center text-gray-500 italic py-10 flex flex-col items-center gap-2"
    >
      <DocumentArrowUpIcon className="w-8 h-8 text-gray-400" />
      {message}
    </motion.div>
  );
}
