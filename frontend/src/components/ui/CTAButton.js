import React from 'react';

export default function CTAButton({ className = '', children, ...props }) {
  return (
    <button
      className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
