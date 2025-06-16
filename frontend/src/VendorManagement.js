import React, { useEffect, useState } from 'react';
import Skeleton from './components/Skeleton';
import { Link } from 'react-router-dom';
import SidebarNav from './components/SidebarNav';

function VendorManagement() {
  const token = localStorage.getItem('token') || '';
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesInput, setNotesInput] = useState({});
  const [notifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchVendors = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:3000/api/vendors', { headers });
    const data = await res.json();
    if (res.ok) setVendors(data.vendors || []);
    setLoading(false);
  };

  useEffect(() => { if (token) fetchVendors(); }, [token]);

  const saveNotes = async (vendor) => {
    const notes = notesInput[vendor] ?? '';
    await fetch(`http://localhost:3000/api/vendors/${encodeURIComponent(vendor)}/notes`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ notes })
    });
    fetchVendors();
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <SidebarNav notifications={notifications} />
      <div className="flex-1 p-4 pt-16">
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow flex justify-between items-center p-4 z-20">
        <h1 className="text-xl font-bold">Vendor Management</h1>
        <Link to="/invoices" className="underline">Back to App</Link>
      </nav>
      <div className="overflow-x-auto rounded-lg">
      <table className="w-full text-left border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-2">Vendor</th>
            <th className="p-2">Last Invoice</th>
            <th className="p-2">Total Spend</th>
            <th className="p-2">Notes</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="p-4"><Skeleton rows={5} height="h-4" /></td>
            </tr>
          ) : (
            vendors.map(v => (
              <tr key={v.vendor} className="border-t hover:bg-gray-100">
                <td className="p-2">{v.vendor}</td>
                <td className="p-2">{v.last_invoice ? new Date(v.last_invoice).toLocaleDateString() : '-'}</td>
                <td className="p-2">${v.total_spend.toFixed(2)}</td>
                <td className="p-2">
                  <textarea
                    className="input w-full p-1"
                    value={notesInput[v.vendor] ?? v.notes}
                    onChange={e => setNotesInput({ ...notesInput, [v.vendor]: e.target.value })}
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => saveNotes(v.vendor)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded"
                    title="Save"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default VendorManagement;
