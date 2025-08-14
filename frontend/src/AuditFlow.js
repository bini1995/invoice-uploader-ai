import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from './components/MainLayout';
import Skeleton from './components/Skeleton';
import StatCard from './components/StatCard.jsx';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { API_BASE } from './api';

// Demo logs shown when the API returns none
const DEMO_LOGS = [
  {
    id: 1,
    created_at: '2024-07-09T13:00:00Z',
    username: 'admin',
    action: 'Login',
    claim_id: null,
  },
  {
    id: 2,
    created_at: '2024-07-09T13:05:00Z',
    username: 'admin',
    action: 'Approved claim #1001',
    claim_id: '1001',
  },
];

export default function AuditFlow() {
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState('');
  const [action, setAction] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [cptIssues, setCptIssues] = useState([]);
  const [reviewerCount, setReviewerCount] = useState(0);

  const resetFilters = () => {
    setVendor('');
    setAction('');
    setStart('');
    setEnd('');
    fetchLogs();
  };

  const exportCsv = async () => {
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (action) params.append('action', action);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const res = await fetch(`${API_BASE}/api/logs/export-csv?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (action) params.append('action', action);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const res = await fetch(`${API_BASE}/api/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data) && data.length) {
      setLogs(data);
      setReviewerCount(new Set(data.map(l => l.username || l.user_id)).size);
    } else {
      setLogs(DEMO_LOGS);
      setReviewerCount(new Set(DEMO_LOGS.map(l => l.username)).size);
    }
    setLoading(false);
  }, [token, vendor, action, start, end]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/api/analytics/claims/fraud`, { headers })
        .then(r => r.json()).then(d => setAnomalyCount(d.suspicious ? d.suspicious.length : 0))
        .catch(() => setAnomalyCount(0)),
      fetch(`${API_BASE}/api/analytics/claims`, { headers })
        .then(r => r.json()).then(d => setCptIssues(d.claims || []))
        .catch(() => setCptIssues([])),
    ]);
  }, [token]);

  if (!['admin','finance','legal'].includes(role)) {
    return <div className="min-h-screen flex items-center justify-center">Access denied.</div>;
  }

  return (
    <MainLayout title="AuditFlow" helpTopic="auditflow">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            title="Anomalies"
            value={anomalyCount}
          />
          <StatCard
            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
            title="CPT Issue Types"
            value={cptIssues.length}
          >
            <ul className="text-xs mt-1">
              {cptIssues.slice(0,3).map(c => (
                <li key={c.claim_type}>{c.claim_type}: {c.count}</li>
              ))}
            </ul>
          </StatCard>
          <StatCard
            icon={<UserGroupIcon className="w-6 h-6" />}
            title="Reviewers"
            value={reviewerCount}
            subtext={`${logs.length} actions`}
          />
        </div>
        <div className="flex flex-wrap items-end gap-4 mb-2">
          <input value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="Vendor" className="input" />
          <input value={action} onChange={e=>setAction(e.target.value)} placeholder="Action" className="input" />
          <div className="relative">
            <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="input pl-8" />
          </div>
          <div className="relative">
            <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="input pl-8" />
          </div>
          <div className="flex items-end gap-2 ml-auto">
            <button onClick={fetchLogs} className="btn btn-primary px-3 py-1">Search</button>
            <button onClick={resetFilters} className="btn btn-ghost px-3 py-1">Reset</button>
            <button onClick={exportCsv} className="btn btn-secondary px-3 py-1">Export CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl shadow-md p-4 mb-4">
        <table className="min-w-full text-sm border rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="px-2 py-1 font-bold border">Time</th>
              <th className="px-2 py-1 font-bold border">User</th>
              <th className="px-2 py-1 font-bold border">Action</th>
              <th className="px-2 py-1 font-bold border">Claim Document</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-4"><Skeleton rows={5} height="h-4"/></td></tr>
            ) : (
              logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                      <p>No AuditFlow logs found. Try changing your filters or upload a claim document to begin tracking actions.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-t hover:bg-gray-100 even:bg-gray-50">
                    <td className="px-2 py-1 border">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-2 py-1 border">{log.username || log.user_id}</td>
                    <td className="px-2 py-1 border">{log.action}</td>
                    <td className="px-2 py-1 border">{log.claim_id || log.invoice_id || '-'}</td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
        </div>
      </div>
    </MainLayout>
  );
}
