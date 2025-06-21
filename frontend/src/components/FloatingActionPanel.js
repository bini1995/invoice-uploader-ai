import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { ChatBubbleLeftRightIcon, ArrowUpTrayIcon, MicrophoneIcon, LightBulbIcon } from '@heroicons/react/24/outline';
export default function FloatingActionPanel({ onUpload, onAsk, onVoice, onFeature }) {
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
      <Tippy content="Let AI summarize uploaded invoices" placement="left">
        <button
          onClick={onAsk}
          className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex flex-col items-center"
          title="Ask AI"
          aria-label="Ask AI"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Ask AI</span>
        </button>
      </Tippy>
      {onFeature && (
        <button
          onClick={onFeature}
          className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex flex-col items-center"
          title="Suggest Feature"
          aria-label="Suggest feature"
        >
          <LightBulbIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Suggest</span>
        </button>
      )}
      {onVoice && (
        <button
          onClick={onVoice}
          className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex flex-col items-center"
          title="Voice Command"
          aria-label="Voice command"
        >
          <MicrophoneIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Voice</span>
        </button>
      )}
    </div>
  );
}
