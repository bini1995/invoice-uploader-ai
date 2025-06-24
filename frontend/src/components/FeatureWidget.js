import React, { useState } from 'react';
import { LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function FeatureWidget({ open, onClose }) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!text.trim()) return;
    try {
      await fetch('http://localhost:3000/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      setSubmitted(true);
      setText('');
    } catch (e) {
      console.error('Suggest feature failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-1">
            <LightBulbIcon className="w-4 h-4" /> Suggest a Feature
          </h3>
          <button onClick={onClose} aria-label="Close">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {submitted ? (
          <div className="text-sm">Thanks for your idea!</div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border rounded p-1 text-sm dark:bg-gray-700"
              rows={3}
              placeholder="Your idea..."
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                Cancel
              </button>
              <button onClick={submit} className="px-3 py-1 rounded bg-indigo-600 text-white">
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
