import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from './components/MainLayout';
import Skeleton from './components/Skeleton';

export default function AuditDashboard() {
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState('');
  const [action, setAction] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (action) params.append('action', action);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const res = await fetch(`http://localhost:3000/api/invoices/logs?${params.toString()}`, {
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
        <div className="flex flex-wrap items-end space-x-2">
          <input value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="Vendor" className="input" />
          <input value={action} onChange={e=>setAction(e.target.value)} placeholder="Action" className="input" />
          <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="input" />
          <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="input" />
          <button onClick={fetchLogs} className="btn btn-primary px-3 py-1">Search</button>
        </div>
        <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="px-2 py-1">Time</th>
              <th className="px-2 py-1">User</th>
              <th className="px-2 py-1">Action</th>
              <th className="px-2 py-1">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-4"><Skeleton rows={5} height="h-4"/></td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-t hover:bg-gray-100">
                  <td className="px-2 py-1">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-2 py-1">{log.username || log.user_id}</td>
                  <td className="px-2 py-1">{log.action}</td>
                  <td className="px-2 py-1">{log.invoice_id || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </MainLayout>
  );
}
