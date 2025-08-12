import React, { useState } from 'react';
import ChatWidget from './ChatWidget';

/**
 * Toggleable chat widget for collaborating on a specific flagged code.
 *
 * @param {Object} props - Component props.
 * @param {string} props.code - The ICD/CPT code under discussion.
 * @returns {JSX.Element|null}
 */
export default function FlaggedCodeChat({ code }) {
  const [open, setOpen] = useState(false);
  if (!code) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-blue-600 underline"
      >
        {open ? 'Hide chat' : `Discuss ${code}`}
      </button>
      {open && <ChatWidget initialMessage={`Discussion for code ${code}`} />}
    </div>
  );
}
