import React from 'react';

export default function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-sm w-full transition-all duration-300 ease-in-out">
        <p className="mb-4 text-sm">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-300 ease-in-out" title="Cancel">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 rounded bg-indigo-600 text-white transition-all duration-300 ease-in-out" title="Confirm">Confirm</button>
        </div>
      </div>
    </div>
  );
}
