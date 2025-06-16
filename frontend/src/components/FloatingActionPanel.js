import React from 'react';
import { ChatBubbleLeftRightIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function FloatingActionPanel({ onUpload, onAsk }) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2 z-30">
      <button
        onClick={onUpload}
        className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex flex-col items-center"
        title="Upload Invoice"
        aria-label="Upload invoice"
      >
        <ArrowUpTrayIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Upload</span>
      </button>
      <button
        onClick={onAsk}
        className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex flex-col items-center"
        title="Ask AI"
        aria-label="Ask AI"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Ask AI</span>
      </button>
    </div>
  );
}
