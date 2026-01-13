import React, { useEffect, useState, useCallback } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import FraudHeader from './components/FraudHeader';
import { API_BASE } from './api';

function FraudReport() {
  const token = localStorage.getItem('token') || '';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState({});

  const unflagInvoice = async (id) => {
    await fetch(`${API_BASE}/api/claims/${id}/flag`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ flagged: false }),
    });
    fetchFlagged();
  };

  const approveInvoice = async (id) => {
    await fetch(`${API_BASE}/api/claims/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchFlagged();
  };

  const fetchFlagged = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/claims/fraud/flagged`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setInvoices(data.invoices || []);
    setLoading(false);
  }, [token]);

  const loadExplanation = async (id) => {
    const res = await fetch(`${API_BASE}/api/claims/${id}/flag-explanation`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setExplanations((e) => ({ ...e, [id]: data.explanation }));
    }
  };

  useEffect(() => { fetchFlagged(); }, [fetchFlagged]);

  return (
    <MainLayout title="Fraud Reports" helpTopic="fraud">
      <div className="space-y-4">
        <FraudHeader
          title="Fraud Reports"
          tooltip="Flagged suspicious documents will appear here."
        />
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full border text-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Vendor</th>
                <th className="px-2 py-1">Amount</th>
                <th className="px-2 py-1">Reason</th>
                <th className="px-2 py-1">Explain</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4"><Skeleton rows={5} height="h-4" /></td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="border-t hover:bg-gray-100">
                    <td className="px-2 py-1">{inv.invoice_number}</td>
                    <td className="px-2 py-1">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-2 py-1">{inv.vendor}</td>
                    <td className="px-2 py-1">${inv.amount}</td>
                    <td className="px-2 py-1">{explanations[inv.id] || inv.flag_reason || '-'}</td>
                    <td className="px-2 py-1">
                      <button onClick={() => loadExplanation(inv.id)} className="btn btn-primary text-xs px-2 py-1 mr-1" title="Explain">AI</button>
                    </td>
                    <td className="px-2 py-1 space-x-1">
                      <button onClick={() => unflagInvoice(inv.id)} className="btn btn-ghost text-xs" title="Unflag">Unflag</button>
                      <button onClick={() => approveInvoice(inv.id)} className="btn btn-ghost text-xs" title="Approve">Approve</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && invoices.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            No fraud reports found. Great job staying secure!
          </p>
        )}
      </div>
    </MainLayout>
  );
}

export default FraudReport;
