import React, { useEffect, useState } from 'react';
import Skeleton from './components/Skeleton';
import { Link } from 'react-router-dom';
import SidebarNav from './components/SidebarNav';
import HelpTooltip from './components/HelpTooltip';

function Archive() {
  const token = localStorage.getItem('token') || '';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [notifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('http://localhost:3000/api/invoices?includeArchived=true', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) {
          setInvoices(d.filter((inv) => inv.archived));
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = invoices.filter((inv) => {
    if (vendor && !inv.vendor.toLowerCase().includes(vendor.toLowerCase())) {
      return false;
    }
    if (startDate && new Date(inv.date) < new Date(startDate)) {
      return false;
    }
    if (endDate && new Date(inv.date) > new Date(endDate)) {
      return false;
    }
    if (priorityOnly && !inv.priority) {
      return false;
    }
    return true;
  });

  const handleRestore = async (id) => {
    const res = await fetch(`http://localhost:3000/api/invoices/${id}/unarchive`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setInvoices((inv) => inv.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <SidebarNav notifications={notifications} />
      <div className="flex-1 p-4 pt-16">
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow flex justify-between items-center p-4 z-20">
        <h1 className="text-3xl font-bold flex items-center gap-1">
          Invoice Archive
          <span className="relative group cursor-help">❓
            <span className="hidden group-hover:block absolute z-10"><HelpTooltip topic="archive" token={token} /></span>
          </span>
        </h1>
        <Link to="/invoices" className="underline">Back to App</Link>
      </nav>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end space-x-2">
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor" className="input" />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
          <label className="flex items-center space-x-1 text-sm">
            <input type="checkbox" checked={priorityOnly} onChange={(e) => setPriorityOnly(e.target.checked)} />
            <span>Priority</span>
          </label>
        </div>
        <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full border text-sm rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="px-2 py-1">#</th>
              <th className="px-2 py-1">Date</th>
              <th className="px-2 py-1">Vendor</th>
              <th className="px-2 py-1">Amount</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4"><Skeleton rows={5} height="h-4" /></td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-100">
                  <td className="px-2 py-1">{inv.invoice_number}</td>
                  <td className="px-2 py-1">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-2 py-1">{inv.vendor}</td>
                  <td className="px-2 py-1">${inv.amount}</td>
                  <td className="px-2 py-1">
                    <button onClick={() => handleRestore(inv.id)} className="btn btn-primary text-xs px-2 py-1" title="Restore">
                      Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Archive;
