import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Skeleton from './components/Skeleton';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import { API_BASE } from './api';
import StatCard from './components/StatCard';
import RuleModal from './components/RuleModal';
import ClaimDetailModal from './components/ClaimDetailModal';

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
  const [includeAI, setIncludeAI] = useState(false);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    anomalies: 0,
    totalAmount: 0,
    avgPerVendor: 0,
    topVendor: '',
  });
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [dashboardInsights, setDashboardInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

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
    const res = await fetch(`${API_BASE}/api/claims/spending-by-tag?${params.toString()}`, {
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
      fetch(`${API_BASE}/api/claims/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/api/claims/quick-stats`, {
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

  const fetchDashboardInsights = useCallback(async () => {
    if (!token) return;
    setLoadingInsights(true);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setDashboardInsights(data);
    } catch (e) {
      console.error('Dashboard insights fetch failed:', e);
    } finally {
      setLoadingInsights(false);
    }
  }, [token]);

  const exportPDF = async () => {
    const params = new URLSearchParams();
    if (vendors.length) params.append('vendor', vendors.join(','));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (selectedTags.length) params.append('tag', selectedTags.join(','));
    if (includeAI) params.append('includeInsights', 'true');
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

  const exportCSV = async () => {
    const params = new URLSearchParams();
    if (vendors.length) params.append('vendor', vendors.join(','));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (selectedTags.length) params.append('tag', selectedTags.join(','));
    const res = await fetch(`${API_BASE}/api/analytics/report/csv?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateInvoice = async (id, field, value) => {
    try {
      await fetch(`${API_BASE}/api/claims/${id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ field, value })
      });
    } catch (e) {
      console.error('Update invoice failed:', e);
    }
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
      fetchDashboardInsights();
    }
  }, [fetchDashboardInsights, token]);

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

  const forecastSeries = dashboardInsights?.forecast?.series || [];
  const roi = dashboardInsights?.roi || {};
  const hitl = dashboardInsights?.hitl || {};
  const modelRegistry = dashboardInsights?.models || [];

  return (
    <ImprovedMainLayout title="AI Spend Analytics Hub" helpTopic="reports">
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Spend Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track spending, anomalies, and AI-driven insights</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" />
              <span className="text-gray-500">to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => applyQuickRange('7d')} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">Last 7 Days</button>
              <button onClick={() => applyQuickRange('lastMonth')} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">Last Month</button>
              <button onClick={() => applyQuickRange('quarter')} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">This Quarter</button>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <label className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={includeAI}
                  onChange={e => setIncludeAI(e.target.checked)}
                />
                Include AI Insights
              </label>
              <button onClick={runReport} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Apply</button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={exportPDF} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Export PDF</button>
            <button onClick={exportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Export CSV</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalInvoices}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4" title="% of invoices that triggered AI anomaly detection">
            <p className="text-sm text-gray-500 dark:text-gray-400">% Anomalies</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalInvoices ? Math.round((summary.anomalies / summary.totalInvoices) * 100) : 0}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total $ Spent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${summary.totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Spend per Vendor</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${summary.avgPerVendor.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Top Spending Vendor</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.topVendor || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                HITL & Predictive Insights
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Copilot-driven escalations with Prophet-style trend forecasting.
              </p>
            </div>
            {loadingInsights && <span className="text-sm text-gray-500">Refreshing insights…</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">HITL Queue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{hitl.queueCount ?? 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escalated: {hitl.escalatedCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">Automation Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{roi.automationRate ?? 0}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Target: 92%+</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{roi.timeSavedHours ?? 0} hrs</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Baseline: {roi.manualMinutes ?? 45}m → {roi.aiMinutes ?? 12}m
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Claims Volume Forecast
              </h3>
              <div className="h-48">
                {forecastSeries.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-gray-500">No forecast data yet.</div>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Domain-Tuned Models (Hugging Face)
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {modelRegistry.length ? (
                  modelRegistry.map((model) => (
                    <li key={model.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.task} • {model.version}</div>
                      <div className="text-xs text-gray-500">{model.fineTunedOn}</div>
                      <div className="text-xs text-gray-500">Status: {model.status}</div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No registered models yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Threshold Rules</h2>
            <button onClick={openNewRule} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">+ Add Rule</button>
          </div>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            {loadingRules ? (
              <Skeleton rows={2} height="h-4" />
            ) : (
              rules.map((r, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="font-medium">{r.flagReason}</span>
                  <span className="text-sm text-gray-500">Triggered: {r.triggered}</span>
                  <div className="space-x-2">
                    <button onClick={() => openEditRule(i)} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Edit</button>
                    <button onClick={() => deleteRule(i)} className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Vendor</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loadingReport ? (
                  <tr>
                    <td colSpan="4" className="p-4"><Skeleton rows={5} height="h-4" /></td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => setDetailInvoice(inv)}
                    >
                      <td className="px-4 py-3">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{inv.vendor}</td>
                      <td className="px-4 py-3 font-medium">${inv.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inv.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                          inv.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {inv.approval_status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spend Heatmap</h2>
            <label className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                className="rounded"
                checked={highlightAnomalies}
                onChange={(e) => setHighlightAnomalies(e.target.checked)}
              />
              Highlight anomaly days
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <th key={d} className="px-2 py-2 font-medium text-center">{d}</th>
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
      </div>
      <RuleModal
        open={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        onSave={saveRule}
        initial={ruleForm}
      />
      <ClaimDetailModal
        open={!!detailInvoice}
        invoice={detailInvoice}
        onClose={() => setDetailInvoice(null)}
        onUpdate={updateInvoice}
        token={token}
      />
    </ImprovedMainLayout>
  );
}

export default AISpendAnalyticsHub;
