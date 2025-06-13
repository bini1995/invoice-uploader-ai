import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function VendorManagement() {
  const token = localStorage.getItem('token') || '';
  const [vendors, setVendors] = useState([]);
  const [notesInput, setNotesInput] = useState({});

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchVendors = async () => {
    const res = await fetch('http://localhost:3000/api/vendors', { headers });
    const data = await res.json();
    if (res.ok) setVendors(data.vendors || []);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <nav className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Vendor Management</h1>
        <Link to="/" className="text-indigo-600 underline">Back to App</Link>
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
          {vendors.map(v => (
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
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default VendorManagement;
