import React from 'react';

export default function TourModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-sm w-full transition-all duration-300 ease-in-out">
        <h2 className="text-lg font-semibold mb-2">Welcome to ClarifyOps</h2>
        <p className="text-sm mb-4">
          Use the Upload button to add invoices, search to filter them and tap an invoice number for full details.
        </p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-3 py-1 rounded w-full transition-all duration-300 ease-in-out"
          title="Close tour"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
