import React from 'react';

export default function Toast({ message, type }) {
  const base = 'px-4 py-2 rounded shadow-lg text-white mb-2';
  const color = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div className={`${base} ${color} animate-fade-in`}>{message}</div>
  );
}
