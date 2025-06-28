import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

function VendorManagement() {
  const token = localStorage.getItem('token') || '';
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesInput, setNotesInput] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newVendor, setNewVendor] = useState('');
  const [newNotes, setNewNotes] = useState('');

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

  const addVendor = async () => {
    if (!newVendor) return;
    await fetch(`${API_BASE}/api/vendors/${encodeURIComponent(newVendor)}/notes`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ notes: newNotes })
    });
    setShowAdd(false);
    setNewVendor('');
    setNewNotes('');
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
      <button
        onClick={() => setShowAdd(true)}
        className="fixed top-24 right-8 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 z-20"
        title="Add Vendor"
        aria-label="Add vendor"
      >
        +
      </button>
      {showAdd && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg space-y-2 w-80">
            <h2 className="text-lg font-semibold">Add Vendor</h2>
            <input
              className="input w-full"
              placeholder="Vendor name"
              value={newVendor}
              onChange={e => setNewVendor(e.target.value)}
            />
            <textarea
              className="input w-full"
              placeholder="Notes"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">
                Cancel
              </button>
              <button onClick={addVendor} className="bg-indigo-600 text-white px-3 py-1 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg mt-4">
      <table className="w-full text-left border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-2">Vendor</th>
            <th className="p-2">Last Invoice</th>
            <th className="p-2">Total Spend</th>
            <th className="p-2">Status</th>
            <th className="p-2">Notes</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="p-4"><Skeleton rows={5} height="h-4" /></td>
            </tr>
          ) : (
            vendors.map(v => (
              <tr key={v.vendor} className="border-t odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <td className="p-2 flex items-center gap-2">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${v.vendor}`}
                    alt={v.vendor}
                    className="h-6 w-6 rounded-full"
                  />
                  {v.vendor}
                </td>
                <td className="p-2">{v.last_invoice ? new Date(v.last_invoice).toLocaleDateString() : '-'}</td>
                <td className="p-2">${v.total_spend.toFixed(2)}</td>
                <td className="p-2 space-x-1">
                  {v.total_spend > 10000 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">High Spend</span>
                  )}
                  {(!v.last_invoice || (Date.now() - new Date(v.last_invoice)) / 86400000 > 90) && (
                    <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </td>
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
