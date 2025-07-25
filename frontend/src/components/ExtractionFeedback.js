import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function ExtractionFeedback({ documentId, initialStatus, onChange }) {
  const [status, setStatus] = useState(initialStatus || '');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    fetch(`${API_BASE}/api/claims/${documentId}/feedback`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status) setStatus(d.status);
        if (d.reason) setReason(d.reason);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/claims/${documentId}/review-notes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => setHistory(d.notes || []))
      .catch(() => {});
  }, [documentId, token]);

  const send = async (value) => {
    setStatus(value);
    try {
      await fetch(`${API_BASE}/api/claims/${documentId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: value, reason, note })
      });
      onChange?.(value);
      setNote('');
    } catch (err) {
      console.error('Feedback error', err);
    }
  };

  const btnCls = (val, base) =>
    `px-2 py-1 border rounded text-xs ${base} ${status === val ? 'opacity-100' : 'opacity-50'}`;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        <button onClick={() => send('correct')} className={btnCls('correct','bg-green-200 dark:bg-green-700')}>Correct</button>
        <button onClick={() => send('incorrect')} className={btnCls('incorrect','bg-red-200 dark:bg-red-700')}>Incorrect</button>
        <button onClick={() => send('needs_review')} className={btnCls('needs_review','bg-yellow-200 dark:bg-yellow-700')}>Needs Review</button>
      </div>
      {status && (
        <div className="flex flex-col gap-2">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="border px-1 py-0.5 text-xs">
            <option value="">Select reason</option>
            <option value="incorrect_field">Incorrect field</option>
            <option value="missing_info">Missing info</option>
            <option value="not_applicable">Not applicable</option>
            <option value="manager_review">Flagged for manager review</option>
          </select>
          <div className="flex gap-2 items-center">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note"
              className="input flex-1 text-xs px-1"
            />
            <button onClick={() => send(status)} className="px-2 py-1 border rounded text-xs bg-indigo-200 dark:bg-indigo-700">
              Save
            </button>
          </div>
          {history.length > 0 && (
            <ul className="text-xs space-y-1 border-t pt-1">
              {history.map((h) => (
                <li key={h.id} className="flex justify-between">
                  <span>{h.note}</span>
                  <span className="opacity-60">{new Date(h.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
