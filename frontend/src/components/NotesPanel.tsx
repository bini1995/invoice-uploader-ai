import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import useReviewNotes from '../hooks/useReviewNotes';

export default function NotesPanel({ claimId, addToast }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const dialogRef = useRef(null);
  const { notes, addNote, isLoading, isError } = useReviewNotes(claimId, open);

  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    node?.focus();
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && node) {
        const focusable = node.querySelectorAll(
          'button, textarea, [href], input, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const submit = async () => {
    try {
      await addNote(text);
      setText('');
    } catch (e) {
      addToast && addToast(e.message, 'error');
    }
  };

  return (
    <>
      <button className="btn btn-ghost p-1 text-xs" onClick={() => setOpen(true)}>
        Notes
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-4 rounded w-80"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notes-title"
            ref={dialogRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="notes-title" className="font-semibold mb-2">Notes</h3>
            {isError && <div className="text-red-600 text-xs">Failed to load notes</div>}
            <ul className="text-sm mb-2 max-h-40 overflow-y-auto">
              {isLoading ? (
                <li>Loading...</li>
              ) : notes.length ? (
                notes.map((n, i) => (
                  <li key={i} className="whitespace-pre-wrap">
                    {n}
                  </li>
                ))
              ) : (
                <li>No notes</li>
              )}
            </ul>
            <textarea
              className="w-full border rounded p-1 text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={!text.trim()}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

NotesPanel.propTypes = {
  claimId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  addToast: PropTypes.func,
};
