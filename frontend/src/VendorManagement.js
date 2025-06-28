import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import EmptyState from './components/EmptyState';
import DummyDataButton from './components/DummyDataButton';
import VendorProfilePanel from './components/VendorProfilePanel';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import VendorDetailModal from './components/VendorDetailModal';
import {
  PencilSquareIcon,
  DocumentChartBarIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { API_BASE } from './api';

function VendorManagement() {
  const token = localStorage.getItem('token') || '';
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [notesInput, setNotesInput] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newVendor, setNewVendor] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [filterSpend, setFilterSpend] = useState('');
  const [filterLastDate, setFilterLastDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterNotesOnly, setFilterNotesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [editingVendor, setEditingVendor] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const [profileVendor, setProfileVendor] = useState(null);
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [detailVendor, setDetailVendor] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const exampleVendors = ['Acme Corp', 'Globex', 'Soylent', 'Initech'];

  const headers = useMemo(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/vendors`, { headers });
    const data = await res.json();
    if (res.ok) {
      let list = data.vendors || [];
      if (showTop) {
        list = [...list].sort((a, b) => b.total_spend - a.total_spend).slice(0, 5);
      }
      setVendors(list);
    }
    setLoading(false);
  }, [headers, showTop]);

  const fetchDuplicates = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/vendors/duplicates`, { headers });
    if (res.ok) {
      const data = await res.json();
      setDuplicates(data.duplicates || []);
    }
  }, [headers]);

  useEffect(() => { if (token) fetchVendors(); }, [fetchVendors, token, showTop]);
  useEffect(() => { if (token) fetchDuplicates(); }, [fetchDuplicates, token]);

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
    await fetch(`${API_BASE}/api/vendors/${encodeURIComponent(newVendor)}/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ contact_email: newEmail, category: newCategory, contact_name: newContactName })
    });
    setShowAdd(false);
    setNewVendor('');
    setNewNotes('');
    setNewEmail('');
    setNewContactName('');
    setNewCategory('');
    fetchVendors();
  };

  const filteredVendors = useMemo(() => {
    let list = [...vendors];
    if (filterSpend) {
      const min = parseFloat(filterSpend) || 0;
      list = list.filter(v => v.total_spend >= min);
    }
    if (filterLastDate) {
      const since = new Date(filterLastDate);
      list = list.filter(v => v.last_invoice && new Date(v.last_invoice) >= since);
    }
    if (filterCategory) {
      const cat = filterCategory.toLowerCase();
      list = list.filter(v => (v.category || '').toLowerCase().includes(cat));
    }
    if (filterNotesOnly) {
      list = list.filter(v => (v.notes || '').trim().length > 0);
    }
    switch (sortBy) {
      case 'recent':
        list.sort((a, b) => new Date(b.last_invoice || 0) - new Date(a.last_invoice || 0));
        break;
      case 'spender':
        list.sort((a, b) => b.total_spend - a.total_spend);
        break;
      default:
        list.sort((a, b) => a.vendor.localeCompare(b.vendor));
    }
    return list;
  }, [vendors, filterSpend, filterLastDate, filterCategory, filterNotesOnly, sortBy]);

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
      <button
        onClick={() => setShowTop(t => !t)}
        className="fixed top-24 right-20 bg-gray-200 dark:bg-gray-700 p-2 rounded shadow z-20"
      >
        {showTop ? 'All Vendors' : 'Top 5'}
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
            <input
              className="input w-full"
              placeholder="Contact name"
              value={newContactName}
              onChange={e => setNewContactName(e.target.value)}
            />
            <input
              className="input w-full"
              placeholder="Contact email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
            />
            <input
              className="input w-full"
              placeholder="Category"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
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
      {duplicates.length > 0 && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded mb-2 text-sm">
          <p className="font-semibold mb-1">Possible Duplicates:</p>
          <ul className="list-disc pl-5 space-y-1">
            {duplicates.map((d, i) => (
              <li key={i}>{d.vendor1} &amp; {d.vendor2}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-4 items-end mt-4 mb-2">
        <div>
          <label className="text-sm">Min Spend</label>
          <input type="number" className="input w-full" value={filterSpend} onChange={e => setFilterSpend(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="text-sm">Last Invoice After</label>
          <input type="date" className="input w-full" value={filterLastDate} onChange={e => setFilterLastDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Category</label>
          <input className="input w-full" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} />
        </div>
        <div className="flex items-center mt-4">
          <input id="notesOnly" type="checkbox" className="mr-1" checked={filterNotesOnly} onChange={e => setFilterNotesOnly(e.target.checked)} />
          <label htmlFor="notesOnly" className="text-sm">Notes only</label>
        </div>
        <div>
          <label className="text-sm">Sort By</label>
          <select className="input w-full" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Vendor name A-Z</option>
            <option value="recent">Most recently active</option>
            <option value="spender">Top spender</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg">
      <table className="w-full text-left border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-2">Vendor</th>
            <th className="p-2">Last Invoice</th>
            <th className="p-2">Total Spend</th>
            <th className="p-2">Status</th>
            <th className="p-2">Contact Email</th>
            <th className="p-2">Category</th>
            <th className="p-2">Tags</th>
            <th className="p-2">Notes</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="p-4"><Skeleton rows={5} height="h-4" /></td>
            </tr>
          ) : filteredVendors.length === 0 ? (
            <tr>
              <td colSpan="9">
                <EmptyState
                  headline="No vendors added yet."
                  description="Start by uploading your first invoice or manually adding a vendor."
                  cta="Add Vendor"
                  onCta={() => setShowAdd(true)}
                >
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">Example vendors:</p>
                    <ul className="list-disc list-inside text-sm">
                      {exampleVendors.map(v => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                    <div className="mt-2">
                      <DummyDataButton />
                    </div>
                  </div>
                </EmptyState>
              </td>
            </tr>
          ) : (
            filteredVendors.map(v => (
              <tr key={v.vendor} className="border-t odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <td className="p-2 flex items-center gap-2">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${v.vendor}`}
                    alt={v.vendor}
                    className="h-6 w-6 rounded-full"
                  />
                  <button onClick={() => setProfileVendor(v.vendor)} className="text-indigo-600 underline">
                    {v.vendor}
                  </button>
                </td>
                <td className="p-2">
                  {v.last_invoice ? (
                    <button className="underline" onClick={async () => {
                      const res = await fetch(`${API_BASE}/api/invoices/search?vendor=${encodeURIComponent(v.vendor)}`, { headers });
                      const data = await res.json();
                      if (Array.isArray(data) && data.length) setDetailInvoice(data[0]);
                    }}>
                      {new Date(v.last_invoice).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </button>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-2">${v.total_spend.toLocaleString()}</td>
                <td className="p-2">
                  {v.total_spend > 20000 ? 'Flagged' : (!v.last_invoice || (Date.now() - new Date(v.last_invoice)) / 86400000 > 90) ? 'Inactive' : 'Active'}
                </td>
                <td className="p-2">{v.contact_email || '-'}</td>
                <td className="p-2">{v.category || '-'}</td>
                <td className="p-2 space-x-1">
                  {v.tags && v.tags.map((t, i) => (
                    <span key={i} className="bg-gray-200 dark:bg-gray-600 px-1 rounded text-xs">{t}</span>
                  ))}
                </td>
                <td className="p-2">
                  {editingVendor === v.vendor ? (
                    <div className="space-y-1">
                      <textarea
                        className="input w-full p-1"
                        value={notesInput[v.vendor] ?? v.notes}
                        onChange={e => setNotesInput({ ...notesInput, [v.vendor]: e.target.value })}
                      />
                      <button className="bg-indigo-600 text-white px-2 py-0.5 rounded text-sm" onClick={() => { saveNotes(v.vendor); setEditingVendor(null); }}>Save</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{(v.notes || '').slice(0,30)}{v.notes && v.notes.length>30 && '…'}</span>
                      <button onClick={() => setEditingVendor(v.vendor)} title="Edit"><PencilSquareIcon className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
                <td className="p-2 flex space-x-2">
                  <button onClick={() => setEditingVendor(v.vendor)} title="Edit"><PencilSquareIcon className="w-4 h-4" /></button>
                  <button onClick={() => setDetailVendor(v.vendor)} title="Details"><DocumentChartBarIcon className="w-4 h-4" /></button>
                  <button onClick={() => navigate(`/invoices?vendor=${encodeURIComponent(v.vendor)}`)} title="View Invoices"><EyeIcon className="w-4 h-4" /></button>
                  <button onClick={async () => { if (window.confirm('Delete vendor?')) { await fetch(`${API_BASE}/api/vendors/${encodeURIComponent(v.vendor)}`, { method: 'DELETE', headers }); fetchVendors(); } }} title="Delete"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      <VendorProfilePanel vendor={profileVendor} open={!!profileVendor} onClose={() => setProfileVendor(null)} token={token} />
      <VendorDetailModal vendor={detailVendor} open={!!detailVendor} onClose={() => setDetailVendor(null)} token={token} />
      <InvoiceDetailModal open={!!detailInvoice} invoice={detailInvoice} onClose={() => setDetailInvoice(null)} token={token} onUpdate={() => {}} />
    </MainLayout>
  );
}

export default VendorManagement;
