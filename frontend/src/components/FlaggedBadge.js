import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { API_BASE } from '../api';

export default function FlaggedBadge({ id }) {
  const token = localStorage.getItem('token') || '';
  const [info, setInfo] = useState(null);

  const loadInfo = async () => {
    if (!token || info) return;
    try {
      const res = await fetch(`${API_BASE}/api/invoices/${id}/flag-explanation`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setInfo(data);
    } catch (err) {
      console.error('Flag explanation load error:', err);
    }
  };

  const content = info
    ? `${info.explanation}${info.confidence !== undefined ? ` (Confidence: ${info.confidence})` : ''}`
    : 'Loading...';

  return (
    <Tippy content={content} onShow={loadInfo} maxWidth={300}>
      <span className="ml-1 text-red-600 border border-red-500 rounded px-1 text-[10px] cursor-help">Why?</span>
    </Tippy>
  );
}
