import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      'bg-white/80 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-md p-6 transition hover:shadow-xl',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };
