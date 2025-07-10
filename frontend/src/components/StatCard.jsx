import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

export default function StatCard({
  icon,
  title,
  value,
  subtext,
  trend,
  cta,
  onCta,
  badge,
  children,
}) {
  const TrendIcon =
    typeof trend === 'number'
      ? trend > 0
        ? ArrowTrendingUpIcon
        : trend < 0
        ? ArrowTrendingDownIcon
        : null
      : null;
  const trendColor =
    typeof trend === 'number'
      ? trend > 0
        ? 'text-green-600'
        : trend < 0
        ? 'text-red-600'
        : 'text-gray-500'
      : 'text-gray-500';

  return (
    <Card className="p-6 flex flex-col gap-2 relative">
      <div className="flex items-start gap-1">
        {icon && <span className="text-indigo-600">{icon}</span>}
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">
          {title}
        </span>
        {badge && (
          <span className="w-2 h-2 rounded-full bg-red-500" />
        )}
      </div>
      <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        {value}
      </div>
      {subtext && (
        <div className={cn('text-xs flex items-center gap-1', trendColor)}>
          {TrendIcon && <TrendIcon className="w-3 h-3" />}
          <span>{subtext}</span>
        </div>
      )}
      {children}
      {cta && (
        <Button
          onClick={onCta}
          size="sm"
          className="mt-2 self-start"
        >
          {cta}
        </Button>
      )}
    </Card>
  );
}
