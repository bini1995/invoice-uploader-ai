import React, { useState, useEffect, useCallback } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';
import CashflowSimulation from './components/CashflowSimulation';
import StatCard from './components/StatCard.jsx';
import RuleModal from './components/RuleModal';

function AISpendAnalyticsHub() {
  const token = localStorage.getItem('token') || '';
  const [vendors, setVendors] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [loadingRules, setLoadingRules] = useState(true);
  const [rules, setRules] = useState([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({ type: 'spend', amount: 1000 });
  const [editIndex, setEditIndex] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [anomalyDays, setAnomalyDays] = useState([]);
  const [highlightAnomalies, setHighlightAnomalies] = useState(false);
  const [vendorList, setVendorList] = useState([]);
  const [tags, setTags] = useState([]); // available tag options
  const [selectedTags, setSelectedTags] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    anomalies: 0,
    totalAmount: 0,
    avgPerVendor: 0,
    topVendor: '',
  });

  const fetchHeatmap = useCallback(async () => {
    setLoadingHeatmap(true);
    const params = new URLSearchParams();
    if (vendors.length) params.append('vendor', vendors.join(','));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (selectedTags.length) params.append('tag', selectedTags.join(','));
    const res = await fetch(`${API_BASE}/api/analytics/spend/heatmap?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setHeatmap(data.heatmap || []);
      setAnomalyDays(data.flaggedDays || []);
    }
    setLoadingHeatmap(false);
  }, [vendors, startDate, endDate, selectedTags, token]);

  const fetchReport = async (s = startDate, e = endDate) => {
    setLoadingReport(true);
    const params = new URLSearchParams();
    if (vendors.length) params.append('vendor', vendors.join(','));
    if (s) params.append('startDate', s);
    if (e) params.append('endDate', e);
    if (selectedTags.length) params.append('tag', selectedTags.join(','));
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
    if (vendors.length) params.append('vendor', vendors.join(','));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (selectedTags.length) params.append('tag', selectedTags.join(','));

    const [dashRes, quickRes, vendorRes] = await Promise.all([
      fetch(`${API_BASE}/api/invoices/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/api/invoices/quick-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/api/analytics/spend/vendor?${new URLSearchParams({ startDate, endDate }).toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    const dashData = await dashRes.json();
    const quickData = await quickRes.json();
    const vendorData = await vendorRes.json();

    if (dashRes.ok && quickRes.ok && vendorRes.ok) {
      const vendors = vendorData.byVendor || [];
      const totalVendorSpend = vendors.reduce((s, v) => s + v.total, 0);
      const avgPerVendor = vendors.length ? totalVendorSpend / vendors.length : 0;
      const top = vendors.reduce((a, v) => (v.total > a.total ? v : a), { vendor: '', total: 0 });
      setSummary({
        totalInvoices: dashData.totalInvoices || 0,
        anomalies: quickData.anomaliesFound || 0,
        totalAmount: dashData.totalAmount || 0,
        avgPerVendor,
        topVendor: top.vendor || ''
      });
    }
  }, [token, vendors, startDate, endDate, selectedTags]);

  const exportPDF = async () => {
    const params = new URLSearchParams();
    if (vendors.length) params.append('vendor', vendors.join(','));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (selectedTags.length) params.append('tag', selectedTags.join(','));
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

  const saveRule = async (data) => {
    const body =
      data.type === 'spend'
        ? { amountGreaterThan: parseFloat(data.amount), flagReason: `Amount over $${data.amount}` }
        : data.type === 'newVendor'
        ? { newVendor: true, flagReason: 'Vendor not seen before' }
        : data.type === 'pastDue'
        ? { pastDue: true, flagReason: 'Invoice past due' }
        : { duplicateId: true, flagReason: 'Duplicate invoice ID' };
    const method = editIndex === null ? 'POST' : 'PUT';
    const url = editIndex === null ? `${API_BASE}/api/analytics/rules` : `${API_BASE}/api/analytics/rules/${editIndex}`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    setShowRuleModal(false);
    setEditIndex(null);
    loadRules();
  };

  const deleteRule = async (idx) => {
    await fetch(`${API_BASE}/api/analytics/rules/${idx}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadRules();
  };

  const openNewRule = () => {
    setEditIndex(null);
    setRuleForm({ type: 'spend', amount: 1000 });
    setShowRuleModal(true);
  };

  const openEditRule = (idx) => {
    const r = rules[idx];
    if (!r) return;
    let type = 'spend';
    if (r.amountGreaterThan) type = 'spend';
    else if (r.newVendor) type = 'newVendor';
    else if (r.pastDue) type = 'pastDue';
    else if (r.duplicateId) type = 'duplicate';
    setRuleForm({ type, amount: r.amountGreaterThan || 1000 });
    setEditIndex(idx);
    setShowRuleModal(true);
  };

  const applyQuickRange = (range) => {
    const now = new Date();
    let start, end;
    if (range === '7d') {
      end = new Date(now);
      start = new Date(now);
      start.setDate(start.getDate() - 6);
    } else if (range === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (range === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
      end = new Date(now.getFullYear(), q * 3 + 3, 0);
    }
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
    fetchReport(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
    fetchSummary();
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
  }, [fetchSummary, token, vendors, startDate, endDate, selectedTags]);

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
    <MainLayout title="AI Spend Analytics Hub" helpTopic="reports">
      <div className="space-y-4 max-w-2xl">
        <div className="sticky top-16 z-10 bg-white dark:bg-gray-800 border-b p-2 flex flex-wrap items-end gap-2">
          <select
            multiple
            value={vendors}
            onChange={e => setVendors(Array.from(e.target.selectedOptions).map(o => o.value))}
            className="input"
          >
            {vendorList.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" />
          <div className="flex space-x-1">
            <button onClick={() => applyQuickRange('7d')} className="btn btn-xs">Last 7 Days</button>
            <button onClick={() => applyQuickRange('lastMonth')} className="btn btn-xs">Last Month</button>
            <button onClick={() => applyQuickRange('quarter')} className="btn btn-xs">This Quarter</button>
          </div>
          <select
            multiple
            value={selectedTags}
            onChange={e => setSelectedTags(Array.from(e.target.selectedOptions).map(o => o.value))}
            className="input"
          >
            {tags.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button onClick={runReport} className="btn btn-primary ml-auto" title="Apply Filters">Apply</button>
          <button onClick={exportPDF} className="btn btn-primary bg-green-700 hover:bg-green-800" title="Export PDF">Export PDF</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <StatCard title="Total Invoices" value={summary.totalInvoices} />
          <div title="% of invoices that triggered AI anomaly detection, fraud suspicion, or policy mismatch.">
            <StatCard
              title="% Anomalies"
              value={`${summary.totalInvoices ? Math.round((summary.anomalies / summary.totalInvoices) * 100) : 0}%`}
            />
          </div>
          <StatCard title="Total $ Spent" value={`$${summary.totalAmount.toFixed(2)}`} />
          <StatCard title="Avg Spend per Vendor" value={`$${summary.avgPerVendor.toFixed(2)}`} />
          <StatCard title="Top Spending Vendor" value={summary.topVendor || 'N/A'} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">AI Threshold Rules</h2>
          <div className="flex justify-between items-center mb-2">
            <button onClick={openNewRule} className="btn btn-primary" title="Add Rule">+ Add Rule</button>
          </div>
          <ul className="space-y-1 text-gray-700 dark:text-gray-300">
            {loadingRules ? (
              <Skeleton rows={2} height="h-4" />
            ) : (
              rules.map((r, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>{r.flagReason}</span>
                  <span className="text-xs ml-2">Triggered: {r.triggered}</span>
                  <div className="space-x-1">
                    <button onClick={() => openEditRule(i)} className="btn btn-xs">Edit</button>
                    <button onClick={() => deleteRule(i)} className="btn btn-xs">Delete</button>
                  </div>
                </li>
              ))
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
          <div className="flex items-center mb-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1">Spend Heatmap</h2>
            <label className="text-sm flex items-center">
              <input
                type="checkbox"
                className="mr-1"
                checked={highlightAnomalies}
                onChange={(e) => setHighlightAnomalies(e.target.checked)}
              />
              Highlight anomaly days
            </label>
          </div>
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
                  const map = Object.fromEntries(heatmap.map(h => [h.day, h.total]));
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
                  const max = heatmap.reduce((m,h) => Math.max(m,h.total),0);
                  return rows.map((week,i) => (
                    <tr key={i} className="text-center">
                      {week.map((date,j) => {
                        if (!date) return <td key={j}></td>;
                        const key = date.toISOString().slice(0,10);
                        const amt = map[key] || 0;
                        const intensity = max ? amt / max : 0;
                        const bg = `rgba(34,197,94,${intensity})`;
                        return (
                          <td
                            key={j}
                            style={{ backgroundColor: bg, border: highlightAnomalies && anomalyDays.includes(key) ? '2px solid red' : undefined }}
                            className="w-6 h-6 cursor-pointer"
                            onClick={() => handleDayClick(key)}
                            title={`${date.toLocaleDateString()}: $${amt.toFixed(2)}`}
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
      <RuleModal
        open={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        onSave={saveRule}
        initial={ruleForm}
      />
    </MainLayout>
  );
}

export default AISpendAnalyticsHub;
