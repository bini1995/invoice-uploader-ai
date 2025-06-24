import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Skeleton from './Skeleton';
import { API_BASE } from '../api';

export default function ProgressDashboard() {
  const token = localStorage.getItem('token') || '';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API_BASE}/api/invoices/progress`, { headers })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) setStats(d);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Skeleton rows={3} className="h-40" />;
  if (!stats) return null;

  const data = [
    { name: 'Uploaded', value: stats.uploaded },
    { name: 'Categorized', value: stats.categorized },
    { name: 'Flagged', value: stats.flagged },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
