import React from 'react';

export default function ExplanationModal({ open, invoice, explanation, score, onClose }) {
  if (!open || !invoice) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg w-96 max-w-full">
        <h2 className="text-lg font-semibold mb-2">Invoice #{invoice.invoice_number}</h2>
        <div className="text-sm whitespace-pre-wrap mb-2">{explanation}</div>
        {score !== undefined && (
          <div className="text-sm mb-2">Anomaly Score: {score}</div>
        )}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
