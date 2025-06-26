import * as React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

export const Alert = ({ type = 'success', children, className }) => {
  const Icon = type === 'error' ? XCircleIcon : CheckCircleIcon;
  const color =
    type === 'error'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-green-50 border-green-200 text-green-700';
  return (
    <div
      className={cn(
        'flex items-start gap-2 p-3 border rounded-md text-sm',
        color,
        className
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
};
