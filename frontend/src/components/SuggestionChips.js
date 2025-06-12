import React from 'react';

export default function SuggestionChips({ suggestions = [], onClick }) {
  if (!suggestions.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onClick && onClick(s)}
          className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs hover:bg-indigo-200"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
