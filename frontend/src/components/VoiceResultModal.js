import React from 'react';

export default function VoiceResultModal({ open, command, result, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg w-96 max-w-full">
        <h2 className="text-lg font-semibold mb-2">Voice Command</h2>
        <div className="text-sm mb-2"><strong>You said:</strong> {command}</div>
        <div className="text-sm whitespace-pre-wrap">{result}</div>
        <div className="flex justify-end mt-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
