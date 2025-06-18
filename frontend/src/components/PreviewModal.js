import React from 'react';

export default function PreviewModal({ open, onClose, onConfirm, data }) {
  if (!open || !data) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg w-96 max-w-full transition-all duration-300 ease-in-out">
        <h2 className="text-lg font-semibold mb-2">Preview {data.name}</h2>
        <div className="overflow-x-auto max-h-60 border rounded-lg">
          <table className="table-auto text-xs w-full rounded-lg overflow-hidden">
            <thead>
              <tr>
                {data.preview[0].map((h, i) => (
                  <th key={i} className="px-1 py-0.5 text-left border-b">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.preview.slice(1).map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-100">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-1 py-0.5 border-b">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end space-x-2 mt-2">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-3 py-1 rounded bg-indigo-600 text-white text-sm transition-all duration-300 ease-in-out"
              title="Upload"
            >
              Upload
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all duration-300 ease-in-out"
            title="Close"
            aria-label="Close preview"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
