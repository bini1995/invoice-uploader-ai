import React, { useState, useEffect, useCallback } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

function Reports() {
  const token = localStorage.getItem('token') || '';
  const [vendor, setVendor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingRules, setLoadingRules] = useState(true);
  const [threshold, setThreshold] = useState(5000);
  const [rules, setRules] = useState([]);

  const fetchReport = async () => {
    setLoadingReport(true);
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (minAmount) params.append('minAmount', minAmount);
    if (maxAmount) params.append('maxAmount', maxAmount);
    const res = await fetch(`${API_BASE}/api/analytics/report?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setInvoices(data.invoices || []);
    setLoadingReport(false);
  };

  const exportPDF = async () => {
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (minAmount) params.append('minAmount', minAmount);
    if (maxAmount) params.append('maxAmount', maxAmount);
    const res = await fetch(`${API_BASE}/api/analytics/report/pdf?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const loadRules = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/analytics/rules`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setRules(data.rules || []);
    setLoadingRules(false);
  }, [token]);

  const addAmountRule = async () => {
    await fetch(`${API_BASE}/api/analytics/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amountGreaterThan: parseFloat(threshold), flagReason: `Amount over $${threshold}` })
    });
    loadRules();
  };

  useEffect(() => {
    if (token) {
      setLoadingRules(true);
      loadRules();
    }
  }, [loadRules, token]);

  return (
    <MainLayout title="Reports" helpTopic="reports">
      <div className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-2">
          <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Vendor" className="input" />
          <div className="flex space-x-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input w-full" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input w-full" />
          </div>
          <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="Min" className="input" />
          <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="Max" className="input" />
        </div>
        <div className="space-x-2">
          <button onClick={fetchReport} className="btn btn-primary" title="Run Report">Run Report</button>
          <button onClick={exportPDF} className="btn btn-primary bg-green-700 hover:bg-green-800" title="Export PDF">Export PDF</button>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">Auto-Flag Rule</h2>
          <div className="flex space-x-2 items-center">
            <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} className="input w-32" />
            <button onClick={addAmountRule} className="btn btn-primary" title="Set Threshold">Set Threshold</button>
          </div>
          <ul className="list-disc pl-5 mt-2 text-gray-700 dark:text-gray-300">
            {loadingRules ? (
              <Skeleton rows={2} height="h-4" />
            ) : (
              rules.map((r, i) => <li key={i}>{r.flagReason}</li>)
            )}
          </ul>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full border text-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Vendor</th>
                <th className="px-2 py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loadingReport ? (
                <tr>
                  <td colSpan="4" className="p-4"><Skeleton rows={5} height="h-4" /></td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="border-t hover:bg-gray-100">
                    <td className="px-2 py-1">{inv.invoice_number}</td>
                    <td className="px-2 py-1">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-2 py-1">{inv.vendor}</td>
                    <td className="px-2 py-1">${inv.amount}</td>
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

export default Reports;
