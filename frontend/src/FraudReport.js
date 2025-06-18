import React, { useEffect, useState, useCallback } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';

function FraudReport() {
  const token = localStorage.getItem('token') || '';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState({});

  const fetchFlagged = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch('http://localhost:3000/api/invoices/fraud/flagged', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setInvoices(data.invoices || []);
    setLoading(false);
  }, [token]);

  const loadExplanation = async (id) => {
    const res = await fetch(`http://localhost:3000/api/invoices/${id}/flag-explanation`, {
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4"><Skeleton rows={5} height="h-4" /></td>
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
                      <button onClick={() => loadExplanation(inv.id)} className="btn btn-primary text-xs px-2 py-1" title="Explain">AI</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default FraudReport;
