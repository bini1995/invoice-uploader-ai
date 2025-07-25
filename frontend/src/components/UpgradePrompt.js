import React, { useEffect } from 'react';
import { API_BASE } from '../api';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function UpgradePrompt({ open, used, limit, onClose }) {
  useEffect(() => {
    if (open) {
      fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'upgrade_prompt_seen' })
      }).catch(() => {});
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed bottom-4 right-4 sm:right-4 sm:left-auto left-1/2 transform -translate-x-1/2 sm:transform-none bg-indigo-600 text-white p-3 rounded shadow z-50 flex items-center space-x-2 w-11/12 sm:w-auto">
      <span className="text-sm">You’ve used {used} of {limit} claims.</span>
      <a href="/pricing" className="underline text-sm">Upgrade</a>
      <button onClick={onClose} aria-label="Close" className="ml-1">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
