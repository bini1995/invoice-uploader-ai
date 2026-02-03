import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <span className={`font-bold tracking-tight ${sizes[size]} ${className}`}>
      <span className="text-slate-800 dark:text-white">CLARIFY</span>
      <span className="text-purple-600">OPS</span>
    </span>
  );
}

export function LogoLight({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <span className={`font-bold tracking-tight ${sizes[size]} ${className}`}>
      <span className="text-white">CLARIFY</span>
      <span className="text-purple-300">OPS</span>
    </span>
  );
}
