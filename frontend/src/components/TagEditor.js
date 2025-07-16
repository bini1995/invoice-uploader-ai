import React, { useState } from 'react';

export default function TagEditor({ tags = [], onAddTag, onRemoveTag, colorMap = {} }) {
  const safeTags = Array.isArray(tags) ? tags : [];
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      onAddTag && onAddTag(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {safeTags.map((tag, idx) => (
        <span
          key={idx}
          className="flex items-center text-xs px-2 py-0.5 rounded text-white"
          style={{ backgroundColor: colorMap[tag] || '#6366f1' }}
        >
          {tag}
          {onRemoveTag && (
            <button
              onClick={() => onRemoveTag(tag)}
              className="ml-1 text-white focus:outline-none"
            >
              ×
            </button>
          )}
        </span>
      ))}
      {onAddTag && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag"
          className="input text-xs w-20 px-1"
        />
      )}
    </div>
  );
}
