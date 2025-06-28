import React from 'react';
import { Card } from './ui/Card';

export default function StatCard({ title, value }) {
  return (
    <Card className="text-center p-4">
      <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {value}
      </div>
    </Card>
  );
}
