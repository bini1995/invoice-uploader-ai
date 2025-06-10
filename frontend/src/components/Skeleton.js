import React from 'react';

export default function Skeleton({ rows = 5, className = '', height = 'h-6' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className={`${height} bg-gray-200 rounded animate-pulse`} />
      ))}
    </div>
  );
}
