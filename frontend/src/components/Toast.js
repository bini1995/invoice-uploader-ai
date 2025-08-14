import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function Toast({ message, type, actionText, onAction, ariaLive = 'assertive' }) {
  const base =
    'px-4 py-2 rounded-md shadow-lg ring-1 ring-black/20 text-white mb-2 flex items-center space-x-2 backdrop-blur-sm';
  const color = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  const Icon = type === 'error' ? XCircleIcon : CheckCircleIcon;
  return (
    <div className={`${base} ${color} animate-slide-in-right`} role="alert" aria-live={ariaLive}>
      <Icon className="h-5 w-5" />
      <span className="flex-1">{message}</span>
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
