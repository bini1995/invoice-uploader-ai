import React from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function FloatingButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
      aria-label="Quick action"
    >
      <PlusIcon className="w-6 h-6" />
    </button>
  );
}
