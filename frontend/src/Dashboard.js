import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Skeleton from './components/Skeleton';
import EmptyState from './components/EmptyState';
import VendorProfilePanel from './components/VendorProfilePanel';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

function Dashboard() {
  const token = localStorage.getItem('token') || '';
  const [vendors, setVendors] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [stats, setStats] = useState(null);
  const [approvalStats, setApprovalStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [budget, setBudget] = useState([]);
  const [remainingBudget, setRemainingBudget] = useState([]);
  const [budgetForecast, setBudgetForecast] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/invoices/top-vendors`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setVendors(d.topVendors || []);
        }),
      fetch(`${API_BASE}/api/invoices/spending-by-tag`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setCategories(d.byTag || []);
        }),
      fetch(`${API_BASE}/api/invoices/cash-flow?interval=monthly`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setCashFlow(d.data || []);
        }),
      fetch(`${API_BASE}/api/invoices/anomalies`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setAnomalies(d.anomalies || []);
        }),
      fetch(`${API_BASE}/api/invoices/budgets/department-report`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) {
            setBudget(d.data || []);
            setRemainingBudget((d.data || []).map(b => ({ department: b.department, remaining: b.remaining })));
          }
        }),
      fetch(`${API_BASE}/api/invoices/budgets/forecast`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => { if (ok) setBudgetForecast(d.forecast || []); }),
      fetch(`${API_BASE}/api/invoices/upload-heatmap`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setHeatmap(d.heatmap || []);
        }),
      fetch(`${API_BASE}/api/invoices/quick-stats`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setStats(d);
        }),
      fetch(`${API_BASE}/api/analytics/approvals/stats`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setApprovalStats(d);
        }),
    ]).finally(() => setLoading(false));
  }, [token]);

  const handleExportPDF = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch(`${API_BASE}/api/invoices/dashboard/pdf`, { headers });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const res = await fetch(`${API_BASE}/api/invoices/dashboard/share`, { method: 'POST', headers, body: JSON.stringify({}) });
    if (res.ok) {
      const { url } = await res.json();
      const full = `http://localhost:3001/dashboard/shared/${url.split('/').pop()}`;
      try { await navigator.clipboard.writeText(full); } catch (_) {}
      alert('Share link copied to clipboard');
    }
  };

  const handleApprovalReminders = async () => {
    if (!stats?.invoicesPending) return;
    const headers = { Authorization: `Bearer ${token}` };
    await fetch(`${API_BASE}/api/reminders/approval`, { method: 'POST', headers });
    alert('Approval reminder emails sent');
  };

  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  let max = 0;
  heatmap.forEach(({ day, hour, count }) => {
    grid[day][hour] = count;
    if (count > max) max = count;
  });

  return (
    <MainLayout title="AI Dashboard">
      <div className="mb-4 text-right space-x-2">
        <button onClick={handleExportPDF} className="underline">Export PDF</button>
        <button onClick={handleShare} className="underline">Share Link</button>
        {stats?.invoicesPending > 0 && (
          <button onClick={handleApprovalReminders} className="underline">
            Send Approval Reminders
          </button>
        )}
      </div>
      {!token ? (
        <p className="text-center text-gray-600">Please log in from the main app.</p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              <Skeleton rows={1} className="h-20 col-span-2 md:col-span-4" />
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}
                  className="p-4 bg-white dark:bg-gray-800 rounded shadow transition"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    💵 Total Invoiced This Month
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.totalInvoicedThisMonth?.toFixed(2) || 0}
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }} className="p-4 bg-white dark:bg-gray-800 rounded shadow transition">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    🧾 Invoices Pending
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.invoicesPending || 0}
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }} className="p-4 bg-white dark:bg-gray-800 rounded shadow transition">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ⚠️ Anomalies Found
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.anomaliesFound || 0}
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }} className="p-4 bg-white dark:bg-gray-800 rounded shadow transition">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    🤖 AI Suggestions Available
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.aiSuggestions || 0}
                  </div>
                </motion.div>
              </>
            )}
          </div>
          {approvalStats && (
            <div className="text-center text-sm text-gray-700 dark:text-gray-300">
              🎉 You've approved {approvalStats.total} invoices this week! Streak: {approvalStats.streak} days
            </div>
          )}
          {vendors.length === 0 && !loading && (
            <EmptyState message="No data yet. Here are some sample vendors to explore:" onCta={null}>
              <ul className="list-disc list-inside text-gray-600 text-sm mt-2">
                <li>Acme Corp</li>
                <li>Globex Inc</li>
                <li>Soylent Corp</li>
              </ul>
            </EmptyState>
          )}
          <div className="h-64">
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={vendors} dataKey="total" nameKey="vendor" outerRadius={80}>
                      {vendors.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
          <div className="h-64">
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Suspicious Pattern Heatmap</h2>
            <div className="overflow-x-auto rounded-lg">
              <table className="table-fixed border-collapse rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th></th>
                    {Array.from({ length: 24 }).map((_, h) => (
                      <th key={h} className="px-1 text-xs font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((row, d) => (
                    <tr key={d} className="text-center">
                      <td className="pr-1 text-xs font-normal">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</td>
                      {row.map((c, h) => {
                        const intensity = max ? Math.round((c / max) * 255) : 0;
                        const bg = `rgba(220,38,38,${intensity / 255})`;
                        return <td key={h} style={{ backgroundColor: bg }} className="w-4 h-4"></td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Highest Vendor Expenses</h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              {vendors.map(v => (
                <li key={v.vendor}>
                  <button onClick={() => setSelectedVendor(v.vendor)} className="underline">
                    {v.vendor}
                  </button>: ${v.total.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Spend by Category</h2>
            {loading ? (
              <Skeleton rows={1} className="h-64" />
            ) : (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categories} dataKey="total" nameKey="tag" outerRadius={80}>
                      {categories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Unusual Invoice Spikes</h2>
            {anomalies.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={anomalies} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vendor" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avg" fill="#3b82f6" name="Avg" />
                  <Bar dataKey="last" fill="#ef4444" name="Last" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-600">No anomalies detected</p>
            )}
          </div>
          <div className="h-64">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Budget vs Actual</h2>
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budget} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                    <Bar dataKey="budget" fill="#ef4444" name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
          <div className="h-64">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Remaining Budget</h2>
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={remainingBudget} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="remaining" fill="#4ade80" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
          <div className="h-64">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Budget Forecast</h2>
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetForecast} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="forecast" fill="#3b82f6" name="Forecast" />
                    <Bar dataKey="budget" fill="#ef4444" name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
          <VendorProfilePanel vendor={selectedVendor} open={!!selectedVendor} onClose={() => setSelectedVendor(null)} token={token} />
        </div>
      )}
    </MainLayout>
  );
}

export default Dashboard;
