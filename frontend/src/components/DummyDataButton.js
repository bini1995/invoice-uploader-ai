import React, { useState } from 'react';
import { API_BASE } from '../api';

export default function DummyDataButton() {
  const token = localStorage.getItem('token') || '';
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setDone(false);
    const res = await fetch(`${API_BASE}/api/invoices/seed-dummy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setDone(true);
    setLoading(false);
  };

  return (
    <button className="btn btn-secondary" onClick={handleSeed} disabled={loading}>
      {loading ? 'Seeding...' : done ? 'Seeded!' : 'Seed Dummy Data'}
    </button>
  );
}
