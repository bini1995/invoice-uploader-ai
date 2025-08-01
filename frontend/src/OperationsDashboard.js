import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import Skeleton from './components/Skeleton';
import EmptyState from './components/EmptyState';
import VendorProfilePanel from './components/VendorProfilePanel';
import FloatingButton from './components/FloatingButton';
import MainLayout from './components/MainLayout';
import StatCard from './components/StatCard.jsx';
import LiveFeed from './components/LiveFeed';
import OnboardingChecklist from './components/OnboardingChecklist';
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
  total: '💵 Total Claim Document Spend This Month',
  pending: '🧾 Claim Documents Pending',
  anomalies: '⚠️ Anomalies Found',
  ai: '🤖 AI Suggestions Available',
};

function OperationsDashboard() {
  const token = localStorage.getItem('token') || '';
  const tenant = localStorage.getItem('tenant') || 'default';
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
  const [trends, setTrends] = useState([]);
  const [flaggedTrend, setFlaggedTrend] = useState([]);
  const [scorecards, setScorecards] = useState([]);
  const [graphView, setGraphView] = useState('spend');
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
      fetch(`${API_BASE}/api/analytics/trends`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) setTrends(d.trends || []);
        }),
      fetch(`${API_BASE}/api/invoices/fraud/flagged`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok) {
            const counts = {};
            (d.invoices || []).forEach((inv) => {
              const month = inv.date?.slice(0, 7);
              if (month) counts[month] = (counts[month] || 0) + 1;
            });
            const arr = Object.entries(counts)
              .map(([m, c]) => ({ month: `${m}-01`, count: c }))
              .sort((a, b) => new Date(a.month) - new Date(b.month));
            setFlaggedTrend(arr);
          }
        }),
      fetch(`${API_BASE}/api/invoices/vendor-scorecards`, { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => { if (ok) setScorecards(d.scorecards || []); }),
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

  const tasks = React.useMemo(() => {
    const list = [];
    if (stats?.invoicesPending) {
      list.push(`${stats.invoicesPending} invoices pending review`);
    }
    if (anomalies?.length) {
      list.push(`New anomaly found in ${anomalies[0].vendor}`);
    }
    return list;
  }, [stats, anomalies]);

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
                                  title="Total Document Spend"
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
                                  title="Claim Documents Pending"
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
              description="Upload your first document to begin tracking spend, surfacing anomalies, and unlocking AI insights."
              cta="Upload Document"
              onCta={() => navigate('/upload')}
            />
          )}
          <div className="h-64">
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : vendors.length ? (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="overflow-x-auto">
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
                </div>
              </motion.div>
            ) : (
              <p className="text-center mt-24 text-sm text-gray-600">No vendor data yet</p>
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
            ) : cashFlow.length ? (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                      <Bar dataKey="total" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ) : (
              <p className="text-center mt-24 text-sm text-gray-600">No cash flow data</p>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Suspicious Pattern Heatmap</h2>
            <div className="overflow-x-auto rounded-lg">
              <table className="table-fixed border-collapse rounded-lg overflow-hidden table-striped table-hover w-full">
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
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Trends &amp; Insights</h2>
          <div className="text-right mb-1 text-sm">
            View:
            <select
              value={graphView}
              onChange={(e) => setGraphView(e.target.value)}
              className="ml-1 border p-1 text-sm"
            >
              <option value="spend">Spend Trends</option>
              <option value="anomaly">Anomaly Trend</option>
            </select>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="h-48 md:col-span-2">
              {loading ? (
                <Skeleton rows={1} className="h-full" />
              ) : graphView === 'spend' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short' })} />
                    <YAxis />
                    <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              ) : flaggedTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={flaggedTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short' })} />
                    <YAxis />
                    <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <Line type="monotone" dataKey="count" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-600 mt-16">No flagged invoices</p>
              )}
            </div>
            <div>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                {vendors.slice(0, 5).map(v => (
                  <li key={v.vendor}>{v.vendor}: ${v.total.toFixed(2)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Spend by Category</h2>
            {loading ? (
              <Skeleton rows={1} className="h-64" />
            ) : categories.length ? (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="overflow-x-auto">
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
                </div>
              </motion.div>
            ) : (
              <p className="text-center mt-24 text-sm text-gray-600">No category data</p>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Unusual Document Spikes</h2>
            {anomalies.length ? (
              <div className="overflow-x-auto">
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
              </div>
            ) : (
              <p className="text-sm text-gray-600">No anomalies detected</p>
            )}
          </div>
          <div className="h-64">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Budget vs Actual</h2>
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : budget.length ? (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="overflow-x-auto">
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
                </div>
              </motion.div>
            ) : (
              <p className="text-center mt-24 text-sm text-gray-600">No budget data</p>
            )}
          </div>
          <div className="h-64">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Remaining Budget</h2>
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : remainingBudget.length ? (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={remainingBudget} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="remaining" fill="#4ade80" name="Remaining" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ) : (
              <p className="text-center mt-24 text-sm text-gray-600">No budget data</p>
            )}
          </div>
          <div className="h-64">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Budget Forecast</h2>
            {loading ? (
              <Skeleton rows={1} className="h-full" height="h-full" />
            ) : budgetForecast.length ? (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="overflow-x-auto">
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
                </div>
              </motion.div>
            ) : (
              <p className="text-center mt-24 text-sm text-gray-600">No forecast data</p>
            )}
          </div>
          {scorecards.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Vendor Scorecards</h2>
              <div className="overflow-x-auto">
                <table className="table-auto text-xs w-full table-striped table-hover">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left">Vendor</th>
                      <th className="px-2 py-1 text-left">Responsiveness</th>
                      <th className="px-2 py-1 text-left">Payment Consistency</th>
                      <th className="px-2 py-1 text-left">Volume Change %</th>
                      <th className="px-2 py-1 text-left">Price Change %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scorecards.map((s, i) => (
                      <tr key={i}>
                        <td className="border px-2 py-1">{s.vendor}</td>
                        <td className="border px-2 py-1">{s.responsiveness}%</td>
                        <td className="border px-2 py-1">{s.payment_consistency}%</td>
                        <td className="border px-2 py-1">{s.volume_change_pct}%</td>
                        <td className="border px-2 py-1">{s.price_change_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">AI Assistant Feed</h2>
            <LiveFeed token={token} tenant={tenant} />
          </div>
          <OnboardingChecklist />
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h2 className="text-lg font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-100">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-1" /> Alerts &amp; Tasks
            </h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              {tasks.length ? tasks.map((t, i) => (<li key={i}>{t}</li>)) : <li>No tasks</li>}
            </ul>
          </div>
        </div>
        <VendorProfilePanel vendor={selectedVendor} open={!!selectedVendor} onClose={() => setSelectedVendor(null)} token={token} />
      </div>
    )}
    <FloatingButton onClick={() => navigate('/upload-wizard')} />
    </MainLayout>
  );
}

export default OperationsDashboard;
