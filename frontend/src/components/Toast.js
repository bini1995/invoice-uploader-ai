import React from 'react';

export default function Toast({ message, type, actionText, onAction }) {
  const base = 'px-4 py-2 rounded shadow-lg text-white mb-2 flex items-center';
  const color = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div className={`${base} ${color} animate-fade-in`}>
      <span className="flex-1 mr-2">{message}</span>
      {actionText && (
        <button
          className="underline font-semibold"
          onClick={onAction}
          title={actionText}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
