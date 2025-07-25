import React, { useEffect } from 'react';
import { API_BASE } from '../api';

export default function WelcomeModal({ open, onClose }) {
  useEffect(() => {
    if (open) {
      fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'onboarding_modal_shown' })
      }).catch(() => {});
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2">Welcome to AI Claims Data Extractor</h2>
        <p className="text-sm mb-4">Upload a claim document to begin or explore the sample data.</p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-3 py-1 rounded w-full"
          title="Close"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
