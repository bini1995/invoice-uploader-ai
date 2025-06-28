import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function VendorDetailModal({ vendor, open, onClose, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !vendor) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/vendors/${encodeURIComponent(vendor)}/profile`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/vendors/${encodeURIComponent(vendor)}/info`, { headers }).then(r => r.json()),
    ])
      .then(([profile, info]) => {
        setData({ ...profile, info });
      })
      .catch(err => console.error('Vendor detail error:', err))
      .finally(() => setLoading(false));
  }, [open, vendor, token]);

  if (!open) return null;

  const avgSpend = data?.spend?.length
    ? data.spend.reduce((s, m) => s + m.total, 0) / data.spend.length
    : 0;
  const health = data?.risk_score > 50 ? 'At Risk' : 'Healthy';
  const files = (data?.invoices || [])
    .map(i => i.file_name)
    .filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg w-96 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{vendor}</h2>
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm">Close</button>
        </div>
        {loading ? (
          <p className="text-sm">Loading...</p>
        ) : (
          <>
            <div className="text-sm mb-1"><span className="font-medium">Contact:</span> {data?.contact_name || 'N/A'} ({data?.contact_email || 'N/A'})</div>
            <div className="text-sm mb-1"><span className="font-medium">Avg Spend/Month:</span> ${avgSpend.toFixed(2)}</div>
            <div className="text-sm mb-1"><span className="font-medium">Health:</span> {health}</div>
            <div className="text-sm mb-1"><span className="font-medium">Notes:</span> {data?.notes || 'None'}</div>
            <div className="text-sm mb-2"><span className="font-medium">Info:</span> {data?.info?.description || '-'}</div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Invoice Timeline</h3>
              <ul className="text-sm max-h-40 overflow-y-auto space-y-1">
                {(data?.invoices || []).map(inv => (
                  <li key={inv.id} className="border-b pb-1">
                    {new Date(inv.date).toLocaleDateString()} - {inv.invoice_number} - ${parseFloat(inv.amount).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <h3 className="font-semibold text-sm mb-1">Related Files</h3>
              <ul className="text-sm max-h-32 overflow-y-auto space-y-1">
                {files.length ? files.map((f, i) => <li key={i}>{f}</li>) : <li>No files</li>}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
