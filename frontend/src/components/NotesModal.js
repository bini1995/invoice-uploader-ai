import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function NotesModal({ invoice, open, onClose }) {
  const token = localStorage.getItem('token') || '';
  const tenant = localStorage.getItem('tenant') || 'default';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

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

  if (!open || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 w-96 max-h-[80vh] overflow-y-auto">
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
          <button onClick={onClose} className="btn btn-ghost text-xs">Close</button>
          <button onClick={addNote} className="btn btn-primary text-xs" disabled={!newNote.trim()}>Add</button>
        </div>
      </div>
    </div>
  );
}
