import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Skeleton from './Skeleton';
import { API_BASE } from '../api';

export default function AiSearchDemo() {
  const token = localStorage.getItem('token') || '';
  const [query, setQuery] = useState('');
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/api/claims/nl-chart`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ question: query })
    });
    const data = await res.json();
    if (res.ok && data.chart) setChart(data.chart);
    setLoading(false);
  };

  const chartData = chart ? chart.labels.map((l, i) => ({ name: l, value: chart.values[i] })) : [];

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. January vendor spikes"
          className="input flex-1"
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>
      {loading && <Skeleton rows={3} className="h-32" />}
      {!loading && chart && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
