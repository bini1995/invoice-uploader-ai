import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Skeleton from './Skeleton';
import { API_BASE } from '../api';
import { useTranslation } from 'react-i18next';
import { logEvent } from '../lib/analytics';

export default function ProgressDashboard({ from, to, role = 'reviewer' }) {
  const token = localStorage.getItem('token') || '';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    let es;
    const url = `${API_BASE}/api/claims/progress?from=${from || ''}&to=${to || ''}`;
    const fetchData = () => {
      fetch(url, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) {
            setStats(d);
            setLastUpdated(new Date());
          }
        })
        .finally(() => setLoading(false));
    };
    fetchData();
    try {
      es = new EventSource(`${url}&stream=1`, { withCredentials: true });
      es.onmessage = (e) => {
        setStats(JSON.parse(e.data));
        setLastUpdated(new Date());
      };
    } catch {
      const id = setInterval(fetchData, 30000);
      return () => clearInterval(id);
    }
    return () => es && es.close();
  }, [token, from, to]);

  if (loading) return <Skeleton rows={3} className="h-40" />;
  if (!stats) return null;

  const safeStats = { ...stats };
  if (role === 'reviewer') {
    safeStats.flagged = null;
    logEvent('metric_access_denied', { role, metric: 'flagged' });
  }
  if (role === 'payer') {
    safeStats.uploaded = null;
    logEvent('metric_access_denied', { role, metric: 'uploaded' });
  }

  const data = [
    { name: 'Uploaded', value: safeStats.uploaded },
    { name: 'Categorized', value: safeStats.categorized },
    { name: 'Flagged', value: safeStats.flagged },
  ];

  const handleBarClick = (bar) => {
    const status = bar.activeLabel?.toLowerCase();
    if (!status) return;
    const requestId = crypto.randomUUID();
    logEvent('dashboard_drilldown', { status, from, to, request_id: requestId });
    navigate(`/claims?status=${status}&from=${from || ''}&to=${to || ''}`);
  };

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} onClick={handleBarClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
      {lastUpdated && (
        <div className="text-xs text-muted">
          {t('lastUpdated')}: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
