import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Skeleton from './components/Skeleton';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import ClaimListTable from './components/ClaimListTable';
import { API_BASE } from './api';

function Archive() {
  const token = localStorage.getItem('token') || '';
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/claims?includeArchived=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) {
          setClaims(d.filter((c) => c.archived));
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = claims.filter((claim) => {
    if (
      provider &&
      !claim.provider_name.toLowerCase().includes(provider.toLowerCase())
    ) {
      return false;
    }
    if (startDate && new Date(claim.service_date) < new Date(startDate)) {
      return false;
    }
    if (endDate && new Date(claim.service_date) > new Date(endDate)) {
      return false;
    }
    if (priorityOnly && !claim.priority) {
      return false;
    }
    return true;
  });

  const handleRestore = useCallback(
    async (id) => {
      const res = await fetch(`${API_BASE}/api/claims/${id}/unarchive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setClaims((cl) => cl.filter((c) => c.id !== id));
      }
    },
    [token]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'claim_id', header: 'Claim ID' },
      { accessorKey: 'provider_name', header: 'Provider' },
      { accessorKey: 'claim_type', header: 'Claim Type' },
      { accessorKey: 'status', header: 'Status' },
      {
        accessorKey: 'total_amount',
        header: 'Total Amount',
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
    <ImprovedMainLayout title="Claim Document Archive" helpTopic="archive">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end space-x-2">
          <input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Provider"
            className="input"
          />
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
            <ClaimListTable columns={columns} data={filtered} />
          )}
        </div>
      </div>
    </ImprovedMainLayout>
  );
}

export default Archive;
