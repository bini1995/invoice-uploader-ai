import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from './components/Skeleton';
import VendorProfilePanel from './components/VendorProfilePanel';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

function Dashboard() {
  const token = localStorage.getItem('token') || '';
  const [vendors, setVendors] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [budget, setBudget] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      fetch('http://localhost:3000/api/invoices/top-vendors', { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setVendors(d.topVendors || []);
        }),
      fetch('http://localhost:3000/api/invoices/spending-by-tag', { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setCategories(d.byTag || []);
        }),
      fetch('http://localhost:3000/api/invoices/cash-flow?interval=monthly', { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setCashFlow(d.data || []);
        }),
      fetch('http://localhost:3000/api/invoices/anomalies', { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setAnomalies(d.anomalies || []);
        }),
      fetch('http://localhost:3000/api/invoices/budgets/department-report', { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setBudget(d.data || []);
        }),
      fetch('http://localhost:3000/api/invoices/upload-heatmap', { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setHeatmap(d.heatmap || []);
        }),
      fetch('http://localhost:3000/api/invoices/quick-stats', { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setStats(d);
        }),
    ]).finally(() => setLoading(false));
  }, [token]);

  const handleExportPDF = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch('http://localhost:3000/api/invoices/dashboard/pdf', { headers });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  let max = 0;
  heatmap.forEach(({ day, hour, count }) => {
    grid[day][hour] = count;
    if (count > max) max = count;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-16">
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow flex justify-between items-center p-4 z-20">
        <h1 className="text-xl font-bold">AI Dashboard</h1>
        <div className="space-x-2">
          <button onClick={handleExportPDF} className="underline mr-2">Export PDF</button>
          <Link to="/" className="underline">Back to App</Link>
        </div>
      </nav>
      {!token ? (
        <p className="text-center text-gray-600">Please log in from the main app.</p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              <Skeleton rows={1} className="h-20 col-span-2 md:col-span-4" />
            ) : (
              <>
                <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    💵 Total Invoiced This Month
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.totalInvoicedThisMonth?.toFixed(2) || 0}
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    🧾 Invoices Pending
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.invoicesPending || 0}
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ⚠️ Anomalies Found
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.anomaliesFound || 0}
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    🤖 AI Suggestions Available
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.aiSuggestions || 0}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="h-64">
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : (
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
            )}
          </div>
          <div className="h-64">
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
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
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Unusual Invoice Spikes</h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              {anomalies.map(a => (
                <li key={a.vendor}>{a.vendor}: avg ${a.avg.toFixed(2)} last ${a.last.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div className="h-64">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Budget vs Actual</h2>
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : (
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
            )}
          </div>
          <VendorProfilePanel vendor={selectedVendor} open={!!selectedVendor} onClose={() => setSelectedVendor(null)} token={token} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
