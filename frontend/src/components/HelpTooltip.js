import React, { useState, useEffect } from 'react';

export default function HelpTooltip({ topic, token }) {
  const [guide, setGuide] = useState('');

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/invoices/help/onboarding?topic=${encodeURIComponent(topic)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setGuide(data.guide);
      } catch (e) {
        console.error('Help fetch failed:', e);
      }
    };
    fetchGuide();
  }, [topic, token]);

  if (!guide) return null;

  return (
    <div className="absolute bg-yellow-100 text-gray-800 p-2 rounded shadow text-xs" style={{ maxWidth: '200px' }}>
      {guide}
    </div>
  );
}
