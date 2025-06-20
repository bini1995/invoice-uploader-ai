import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4', className)} {...props} />
));
Card.displayName = 'Card';

export { Card };
