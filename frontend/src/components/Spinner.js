import React from 'react';

export default function Spinner({ className = 'h-8 w-8' }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${className}`}></div>
    </div>
  );
}
