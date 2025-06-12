import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Reports() {
  const token = localStorage.getItem('token') || '';
  const [vendor, setVendor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [threshold, setThreshold] = useState(5000);
  const [rules, setRules] = useState([]);

  const fetchReport = async () => {
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (minAmount) params.append('minAmount', minAmount);
    if (maxAmount) params.append('maxAmount', maxAmount);
    const res = await fetch(`http://localhost:3000/api/analytics/report?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setInvoices(data.invoices || []);
  };

  const exportPDF = async () => {
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (minAmount) params.append('minAmount', minAmount);
    if (maxAmount) params.append('maxAmount', maxAmount);
    const res = await fetch(`http://localhost:3000/api/analytics/report/pdf?${params.toString()}`, {
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

  const loadRules = async () => {
    const res = await fetch('http://localhost:3000/api/analytics/rules', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setRules(data.rules || []);
  };

  const addAmountRule = async () => {
    await fetch('http://localhost:3000/api/analytics/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amountGreaterThan: parseFloat(threshold), flagReason: `Amount over $${threshold}` })
    });
    loadRules();
  };

  useEffect(() => { if (token) loadRules(); }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <nav className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Reports</h1>
        <Link to="/" className="text-indigo-600 underline">Back to App</Link>
      </nav>
      <div className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-2">
          <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Vendor" className="border p-2 rounded" />
          <div className="flex space-x-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded w-full" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded w-full" />
          </div>
          <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="Min" className="border p-2 rounded" />
          <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="Max" className="border p-2 rounded" />
        </div>
        <div className="space-x-2">
          <button onClick={fetchReport} className="btn btn-primary" title="Run Report">Run Report</button>
          <button onClick={exportPDF} className="btn btn-primary bg-green-700 hover:bg-green-800" title="Export PDF">Export PDF</button>
        </div>
        <div>
          <h2 className="font-semibold mb-1 text-gray-800 dark:text-gray-100">Auto-Flag Rule</h2>
          <div className="flex space-x-2 items-center">
            <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} className="border p-2 rounded w-32" />
            <button onClick={addAmountRule} className="btn btn-primary" title="Set Threshold">Set Threshold</button>
          </div>
          <ul className="list-disc pl-5 mt-2 text-gray-700 dark:text-gray-300">
            {rules.map((r, i) => <li key={i}>{r.flagReason}</li>)}
          </ul>
        </div>
        <div>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Vendor</th>
                <th className="px-2 py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="px-2 py-1">{inv.invoice_number}</td>
                  <td className="px-2 py-1">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-2 py-1">{inv.vendor}</td>
                  <td className="px-2 py-1">${inv.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
