import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from './components/MainLayout';
import Skeleton from './components/Skeleton';
import { CalendarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { API_BASE } from './api';

export default function AuditDashboard() {
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState('');
  const [action, setAction] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

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
    const res = await fetch(`${API_BASE}/api/invoices/logs/export-csv?${params.toString()}`, {
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
    const res = await fetch(`${API_BASE}/api/invoices/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setLogs(data);
    setLoading(false);
  }, [token, vendor, action, start, end]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (!['admin','finance','legal'].includes(role)) {
    return <div className="min-h-screen flex items-center justify-center">Access denied.</div>;
  }

  return (
    <MainLayout title="Audit Dashboard" helpTopic="audit">
      <div className="space-y-4">
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
              <th className="px-2 py-1 font-bold border">Invoice</th>
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
                      <p>No audit logs found. Try changing your filters or upload an invoice to begin tracking actions.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-t hover:bg-gray-100 even:bg-gray-50">
                    <td className="px-2 py-1 border">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-2 py-1 border">{log.username || log.user_id}</td>
                    <td className="px-2 py-1 border">{log.action}</td>
                    <td className="px-2 py-1 border">{log.invoice_id || '-'}</td>
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
