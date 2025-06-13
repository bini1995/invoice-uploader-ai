import React, { useEffect, useState } from 'react';

export default function VendorProfilePanel({ vendor, open, onClose, token }) {
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !vendor) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:3000/api/invoices/search?vendor=${encodeURIComponent(vendor)}`, { headers }).then(r => r.json()),
      fetch(`http://localhost:3000/api/invoices/vendor-profile/${encodeURIComponent(vendor)}`, { headers }).then(r => r.json()),
      fetch('http://localhost:3000/api/vendors', { headers }).then(r => r.json()),
    ])
      .then(([hist, prof, vendors]) => {
        setHistory(Array.isArray(hist) ? hist : []);
        setProfile(prof || null);
        const match = vendors.vendors?.find(v => v.vendor.toLowerCase() === vendor.toLowerCase());
        setNotes(match?.notes || '');
      })
      .catch(err => console.error('Vendor profile error:', err))
      .finally(() => setLoading(false));
  }, [vendor, open, token]);

  const totalSpend = history.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`absolute right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 space-y-2 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">{vendor}</h2>
            <button onClick={onClose} className="text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-700" title="Close">Close</button>
          </div>
          {loading ? (
            <p className="text-sm">Loading...</p>
          ) : (
            <>
              <div className="text-sm"><span className="font-medium">Notes:</span> {notes || 'None'}</div>
              <div className="text-sm"><span className="font-medium">Payment Terms:</span> {profile?.payment_terms || 'N/A'}</div>
              <div className="text-sm"><span className="font-medium">Suggested Tags:</span> {profile?.tags?.join(', ') || 'None'}</div>
              <div className="text-sm"><span className="font-medium">Total Spend:</span> ${totalSpend.toFixed(2)}</div>
              <div>
                <h3 className="font-semibold text-sm mt-2 mb-1">History</h3>
                <ul className="text-sm max-h-40 overflow-y-auto space-y-1">
                  {history.map(h => (
                    <li key={h.id} className="border-b pb-1">
                      {new Date(h.date).toLocaleDateString()} - ${parseFloat(h.amount).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
