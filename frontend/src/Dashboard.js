import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Skeleton from './components/Skeleton';
import EmptyState from './components/EmptyState';
import VendorProfilePanel from './components/VendorProfilePanel';
import MainLayout from './components/MainLayout';
import StatCard from './components/StatCard.jsx';
import { useNavigate } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  InboxIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentArrowUpIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Tippy from '@tippyjs/react';
import ButtonDropdown, { MenuItem } from './components/ButtonDropdown';
import { Button } from './components/ui/Button';
import { API_BASE } from './api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];
const METRIC_LABELS = {
  total: '💵 Total Invoiced This Month',
  pending: '🧾 Invoices Pending',
  anomalies: '⚠️ Anomalies Found',
  ai: '🤖 AI Suggestions Available',
};

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
  const [insights, setInsights] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [cashFlowInterval, setCashFlowInterval] = useState(
    () => localStorage.getItem('dashboardCashFlowInterval') || 'monthly'
  );
  const [metricsOrder, setMetricsOrder] = useState(() => {
    const saved = localStorage.getItem('dashboardMetricsOrder');
    return saved
      ? JSON.parse(saved)
      : ['total', 'pending', 'anomalies', 'ai'];
  });
  const [hiddenMetrics, setHiddenMetrics] = useState(() => {
    const saved = localStorage.getItem('dashboardHiddenMetrics');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dashboardCashFlowInterval', cashFlowInterval);
  }, [cashFlowInterval]);

  useEffect(() => {
    localStorage.setItem('dashboardMetricsOrder', JSON.stringify(metricsOrder));
  }, [metricsOrder]);

  useEffect(() => {
    localStorage.setItem(
      'dashboardHiddenMetrics',
      JSON.stringify(Array.from(hiddenMetrics))
    );
  }, [hiddenMetrics]);

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
      fetch(`${API_BASE}/api/invoices/cash-flow?interval=${cashFlowInterval}`, { headers })
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
      fetch(`${API_BASE}/api/invoices/monthly-insights`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setInsights(d.vendorTotals || []);
        }),
      fetch(`${API_BASE}/api/analytics/approvals/stats`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setApprovalStats(d);
        }),
    ]).finally(() => setLoading(false));
  }, [token, cashFlowInterval]);

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

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(metricsOrder);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setMetricsOrder(items);
  };

  const toggleMetric = (m) => {
    setHiddenMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  };

  const percentChange = React.useMemo(() => {
    if (cashFlow.length < 2) return 0;
    const last = cashFlow[cashFlow.length - 1].total;
    const prev = cashFlow[cashFlow.length - 2].total || 0;
    if (prev === 0) return 0;
    return ((last - prev) / prev) * 100;
  }, [cashFlow]);

  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  let max = 0;
  heatmap.forEach(({ day, hour, count }) => {
    grid[day][hour] = count;
    if (count > max) max = count;
  });

  return (
    <MainLayout title="AI Dashboard">
      <div className="mb-4 flex justify-end gap-2">
        <Tippy content="Export PDF" placement="bottom">
          <Button onClick={handleExportPDF} size="icon" variant="outline">
            <ArrowDownTrayIcon className="w-5 h-5" />
          </Button>
        </Tippy>
        {(vendors.length > 0 || cashFlow.length > 0 || stats) && (
          <Tippy content="Share Link" placement="bottom">
            <Button onClick={handleShare} size="icon" variant="outline">
              <ShareIcon className="w-5 h-5" />
            </Button>
          </Tippy>
        )}
        {stats?.invoicesPending > 0 && (
          <Tippy content="Send Approval Reminders" placement="bottom">
            <Button onClick={handleApprovalReminders} size="icon" variant="outline">
              <InboxIcon className="w-5 h-5" />
            </Button>
          </Tippy>
        )}
        <ButtonDropdown
          icon={<Cog6ToothIcon className="w-5 h-5" />}
          label="Customize View"
        >
          <MenuItem onClick={() => setCustomizeOpen((o) => !o)}>Show/Hide Cards</MenuItem>
          <MenuItem onClick={() => setCustomizeOpen(true)}>Change Time Range</MenuItem>
        </ButtonDropdown>
      </div>
      {customizeOpen && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded shadow text-left space-y-2">
          <div className="space-y-1">
            {metricsOrder.map((m) => (
              <label key={m} className="block text-sm">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={!hiddenMetrics.has(m)}
                  onChange={() => toggleMetric(m)}
                />
                {METRIC_LABELS[m]}
              </label>
            ))}
          </div>
          <div className="text-sm space-x-2">
            <label>Cash Flow Interval:</label>
            <select
              value={cashFlowInterval}
              onChange={(e) => setCashFlowInterval(e.target.value)}
              className="border p-1 text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">Drag metric cards to reorder</p>
        </div>
      )}
      {!token ? (
        <p className="text-center text-gray-600">Please log in from the main app.</p>
      ) : (
        <div className="space-y-8">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="metrics" direction="horizontal">
              {(provided) => (
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {loading ? (
                    <Skeleton rows={1} className="h-20 col-span-2 md:col-span-4" />
                  ) : (
                    metricsOrder.map((m, index) =>
                      hiddenMetrics.has(m) ? null : (
                        <Draggable key={m} draggableId={m} index={index} isDragDisabled={!customizeOpen}>
                          {(prov) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                              {m === 'total' && (
                                <StatCard
                                  icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
                                  title="Total Invoiced"
                                  value={`$${stats?.totalInvoicedThisMonth?.toFixed(2) || 0}`}
                                  subtext={`${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}% from last month`}
                                  trend={percentChange}
                                  cta="View Report"
                                  onCta={() => navigate('/analytics')}
                                />
                              )}
                              {m === 'pending' && (
                                <StatCard
                                  icon={<InboxIcon className="w-5 h-5" />}
                                  title="Invoices Pending"
                                  value={stats?.invoicesPending || 0}
                                  cta="Go to Inbox"
                                  onCta={() => navigate('/inbox')}
                                />
                              )}
                              {m === 'anomalies' && (
                                <StatCard
                                  icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                                  title="Anomalies Found"
                                  value={stats?.anomaliesFound || 0}
                                  badge={stats?.anomaliesFound > 0}
                                  cta={stats?.anomaliesFound > 0 ? 'Review Now' : undefined}
                                  onCta={() => navigate('/audit')}
                                />
                              )}
                              {m === 'ai' && (
                                <StatCard
                                  icon={<SparklesIcon className="w-5 h-5" />}
                                  title="AI Suggestions"
                                  value={stats?.aiSuggestions || 0}
                                  cta="Explore Suggestions"
                                  onCta={() => navigate('/analytics')}
                                >
                                  {insights && insights.slice(0, 2).map((v) => (
                                    <div key={v.vendor} className="text-xs text-gray-500">
                                      {v.vendor}: ${v.total.toFixed(2)}
                                    </div>
                                  ))}
                                </StatCard>
                              )}
                            </div>
                          )}
                        </Draggable>
                      )
                    )
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {approvalStats && (
            <div className="text-center text-sm text-gray-700 dark:text-gray-300">
              🎉 You've approved {approvalStats.total} invoices this week! Streak: {approvalStats.streak} days
            </div>
          )}
          {vendors.length === 0 && !loading && (
            <EmptyState
              icon={<DocumentArrowUpIcon className="w-16 h-16 text-gray-400" />}
              headline="Let's get started!"
              description="Upload your first invoice to begin tracking spend, surfacing anomalies, and unlocking AI insights."
              cta="Upload Invoice"
              onCta={() => navigate('/upload')}
            />
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
            <div className="text-right mb-1 text-sm">
              Interval:
              <select
                value={cashFlowInterval}
                onChange={(e) => setCashFlowInterval(e.target.value)}
                className="ml-2 border p-1 text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
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
