import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { motion } from 'framer-motion';

export default function ProgressBar({ value }) {
  return (
    <Progress.Root className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded h-2 w-full">
      <Progress.Indicator asChild style={{ width: `${value}%` }}>
        <motion.div
          className="bg-indigo-600 dark:bg-indigo-500 w-full h-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </Progress.Indicator>
    </Progress.Root>
  );
}
