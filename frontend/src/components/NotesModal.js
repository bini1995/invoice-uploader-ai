import React, { useEffect, useState, useRef } from 'react';
import { API_BASE } from '../api';

export default function NotesModal({ invoice, open, onClose }) {
  const token = localStorage.getItem('token') || '';
  const tenant = localStorage.getItem('tenant') || 'default';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const dialogRef = useRef(null);
  const lastFocused = useRef(null);
  const scrollPos = useRef(0);

  useEffect(() => {
    if (open && invoice) {
      fetch(`${API_BASE}/api/${tenant}/invoices/${invoice.id}/review-notes`, { headers })
        .then((res) => res.json())
        .then((data) => setNotes(data.notes || []))
        .catch(() => setNotes([]));
    }
  }, [open, invoice]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    await fetch(`${API_BASE}/api/${tenant}/invoices/${invoice.id}/review-notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ note: newNote })
    }).catch(() => {});
    setNewNote('');
    try {
      const res = await fetch(`${API_BASE}/api/${tenant}/invoices/${invoice.id}/review-notes`, { headers });
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement;
      const node = dialogRef.current;
      const handleKey = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab' && node) {
          const focusable = node.querySelectorAll(
            'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
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
      node && node.focus();
      scrollPos.current = window.scrollY;
      window.history.pushState({ modal: true }, '');
      const pop = () => onClose();
      window.addEventListener('popstate', pop);
      return () => {
        document.removeEventListener('keydown', handleKey);
        window.removeEventListener('popstate', pop);
        window.scrollTo(0, scrollPos.current);
        lastFocused.current && lastFocused.current.focus();
      };
    }
  }, [open, onClose]);

  if (!open || !invoice) return null;

  return (
    <div
      data-testid="notes-overlay"
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 transition-all ease-in-out"
      style={{ transitionDuration: 'var(--motion-modal)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative bg-white rounded-t-lg sm:rounded p-4 w-full h-full sm:h-auto sm:w-96 max-h-screen overflow-y-auto transition-all ease-in-out"
        style={{ transitionDuration: 'var(--motion-modal)' }}
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
        tabIndex={-1}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center btn btn-ghost"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-2">Notes for {invoice.invoice_number}</h2>
        <div className="mb-2 space-y-2">
          {notes.length === 0 && <p className="text-sm text-gray-500">No notes yet.</p>}
          {notes.map((n) => (
            <div key={n.id} className="border p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">{new Date(n.created_at).toLocaleString()}</p>
              <p className="text-sm">{n.note}</p>
            </div>
          ))}
        </div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          className="w-full border p-1 text-sm mb-2"
          placeholder="Add a note"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost text-sm px-4 py-2">Close</button>
          <button onClick={addNote} className="btn btn-primary text-sm px-4 py-2" disabled={!newNote.trim()}>Add</button>
        </div>
      </div>
    </div>
  );
}
