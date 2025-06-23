import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

function VendorManagement() {
  const token = localStorage.getItem('token') || '';
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesInput, setNotesInput] = useState({});

  const headers = useMemo(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/vendors`, { headers });
    const data = await res.json();
    if (res.ok) setVendors(data.vendors || []);
    setLoading(false);
  }, [headers]);

  useEffect(() => { if (token) fetchVendors(); }, [fetchVendors, token]);

  const saveNotes = async (vendor) => {
    const notes = notesInput[vendor] ?? '';
    await fetch(`${API_BASE}/api/vendors/${encodeURIComponent(vendor)}/notes`, {
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
    <MainLayout title="Vendor Management" helpTopic="vendors">
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
    </MainLayout>
  );
}

export default VendorManagement;
