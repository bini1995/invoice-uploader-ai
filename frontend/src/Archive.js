import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import DataTable from './components/DataTable';
import { API_BASE } from './api';

function Archive() {
  const token = localStorage.getItem('token') || '';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/invoices?includeArchived=true`, {
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

  const handleRestore = useCallback(
    async (id) => {
      const res = await fetch(`${API_BASE}/api/invoices/${id}/unarchive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInvoices((inv) => inv.filter((i) => i.id !== id));
      }
    },
    [token]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'invoice_number', header: '#' },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      { accessorKey: 'vendor', header: 'Vendor' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: (info) => `$${info.getValue()}`,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => handleRestore(row.original.id)}
            className="btn btn-primary text-xs px-2 py-1"
            title="Restore"
          >
            Restore
          </button>
        ),
        size: 100,
      },
    ],
    [handleRestore]
  );

  return (
    <MainLayout title="Claim Document Archive" helpTopic="archive">
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
          {loading ? (
            <table className="min-w-full border text-sm rounded-lg overflow-hidden">
              <tbody>
                <tr>
                  <td colSpan="5" className="p-4">
                    <Skeleton rows={5} height="h-4" />
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Archive;
