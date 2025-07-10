import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-white/80 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-md p-6 transition hover:shadow-xl',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };
