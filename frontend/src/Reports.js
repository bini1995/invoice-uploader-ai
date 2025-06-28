import React, { useState, useEffect, useCallback } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';
import CashflowSimulation from './components/CashflowSimulation';
import StatCard from './components/StatCard.jsx';

function Reports() {
  const token = localStorage.getItem('token') || '';
  const [vendor, setVendor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [loadingRules, setLoadingRules] = useState(true);
  const [threshold, setThreshold] = useState(5000);
  const [rules, setRules] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState('');
  const [summary, setSummary] = useState({ totalInvoices: 0, flagged: 0, totalAmount: 0 });

  const fetchHeatmap = useCallback(async () => {
    setLoadingHeatmap(true);
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (tag) params.append('tag', tag);
    const res = await fetch(`${API_BASE}/api/analytics/spend/heatmap?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setHeatmap(data.heatmap || []);
    setLoadingHeatmap(false);
  }, [vendor, startDate, endDate, tag, token]);

  const fetchReport = async (s = startDate, e = endDate) => {
    setLoadingReport(true);
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (s) params.append('startDate', s);
    if (e) params.append('endDate', e);
    if (tag) params.append('tag', tag);
    const res = await fetch(`${API_BASE}/api/analytics/report?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setInvoices(data.invoices || []);
    setLoadingReport(false);
    fetchHeatmap();
  };

  const fetchVendors = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/vendors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setVendorList(data.vendors.map(v => v.vendor));
  }, [token]);

  const fetchTags = useCallback(async () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${API_BASE}/api/invoices/spending-by-tag?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setTags(data.byTag.map(t => t.tag));
  }, [token, startDate, endDate]);

  const fetchSummary = useCallback(async () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (tag) params.append('tag', tag);
    const res = await fetch(`${API_BASE}/api/invoices/dashboard?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setSummary({
      totalInvoices: data.totalInvoices || 0,
      flagged: data.aiSuggestions || 0,
      totalAmount: data.totalAmount || 0
    });
  }, [token, vendor, startDate, endDate, tag]);

  const exportPDF = async () => {
    const params = new URLSearchParams();
    if (vendor) params.append('vendor', vendor);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (tag) params.append('tag', tag);
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

  useEffect(() => {
    if (token) {
      fetchVendors();
    }
  }, [fetchVendors, token]);

  useEffect(() => {
    if (token) {
      fetchHeatmap();
    }
  }, [fetchHeatmap, token]);

  useEffect(() => {
    if (token) {
      fetchSummary();
    }
  }, [fetchSummary, token, vendor, startDate, endDate, tag]);

  useEffect(() => {
    if (token) {
      fetchTags();
    }
  }, [fetchTags, token, startDate, endDate]);

  const runReport = () => {
    fetchReport();
    fetchSummary();
  };

  const handleDayClick = (day) => {
    setStartDate(day);
    setEndDate(day);
    fetchReport(day, day);
  };

  return (
    <MainLayout title="Reports" helpTopic="reports">
      <div className="space-y-4 max-w-2xl">
        <div className="sticky top-16 z-10 bg-white dark:bg-gray-800 border-b p-2 flex flex-wrap items-end gap-2">
          <select value={vendor} onChange={e => setVendor(e.target.value)} className="input">
            <option value="">All Vendors</option>
            {vendorList.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" />
          <div className="flex flex-wrap gap-1">
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`px-2 py-0.5 rounded text-xs ${tag === t ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={runReport} className="btn btn-primary ml-auto" title="Apply Filters">Apply</button>
          <button onClick={exportPDF} className="btn btn-primary bg-green-700 hover:bg-green-800" title="Export PDF">Export PDF</button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <StatCard title="Total Invoices" value={summary.totalInvoices} />
          <StatCard title="% Flagged" value={`${summary.totalInvoices ? Math.round((summary.flagged / summary.totalInvoices) * 100) : 0}%`} />
          <StatCard title="Total $ Spent" value={`$${summary.totalAmount.toFixed(2)}`} />
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
        <div>
          <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">Spend Heatmap</h2>
          <div className="overflow-x-auto rounded-lg">
            <table className="table-fixed border-collapse rounded-lg overflow-hidden text-xs">
              <thead>
                <tr>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <th key={d} className="px-1 font-normal">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const map = Object.fromEntries(heatmap.map(h => [h.day, h.count]));
                  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
                  const end = endDate ? new Date(endDate) : new Date(start.getFullYear(), 11, 31);
                  const days = [];
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    days.push(new Date(d));
                  }
                  const first = days[0] ? days[0].getDay() : 0;
                  for (let i = 0; i < first; i++) days.unshift(null);
                  const rows = [];
                  while (days.length) rows.push(days.splice(0,7));
                  const max = heatmap.reduce((m,h) => Math.max(m,h.count),0);
                  return rows.map((week,i) => (
                    <tr key={i} className="text-center">
                      {week.map((date,j) => {
                        if (!date) return <td key={j}></td>;
                        const key = date.toISOString().slice(0,10);
                        const count = map[key] || 0;
                        const intensity = max ? count / max : 0;
                        const bg = `rgba(34,197,94,${intensity})`;
                        return (
                          <td
                            key={j}
                            style={{ backgroundColor: bg }}
                            className="w-6 h-6 cursor-pointer"
                            onClick={() => handleDayClick(key)}
                            title={`${count} invoices`}
                          >
                            {date.getDate()}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          {loadingHeatmap && <p className="text-sm">Loading heatmap...</p>}
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">Cash Flow Simulation</h2>
          <CashflowSimulation token={token} />
        </div>
      </div>
    </MainLayout>
  );
}

export default Reports;
