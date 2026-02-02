import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import Skeleton from './components/Skeleton';
import VendorProfilePanel from './components/VendorProfilePanel';
import RuleModal from './components/RuleModal';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { API_BASE } from './api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

function Sparkline({ prev = 0, cur = 0 }) {
  const data = [
    { name: 'prev', v: prev },
    { name: 'cur', v: cur }
  ];
  return (
    <ResponsiveContainer width={60} height={20}>
      <LineChart data={data} margin={{ top: 4, bottom: 4 }}>
        <Line type="monotone" dataKey="v" stroke="#3b82f6" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AdaptiveCard({ cardId, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cardId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function AdaptiveDashboard() {
  const token = localStorage.getItem('token') || '';
  const [meta, setMeta] = useState(null);
  const [prevMeta, setPrevMeta] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [recs, setRecs] = useState(null);
  const [view, setView] = useState('suggestions');
  const [cardOrder, setCardOrder] = useState(() => {
    const saved = localStorage.getItem('adaptiveCardOrder');
    return saved ? JSON.parse(saved) : ['vendors', 'flagged', 'processing'];
  });
  const [pinned, setPinned] = useState(() => {
    const saved = localStorage.getItem('adaptivePinned');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({ type: 'spend', amount: 1000 });

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    const now = new Date();
    const curStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0,10);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0,10);

    Promise.all([
      fetch(`${API_BASE}/api/analytics/metadata?startDate=${curStart}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/metadata?startDate=${prevStart}&endDate=${prevEnd}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/claims/top-vendors`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/logs?limit=20`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/vendors`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/approvals/times?startDate=${prevStart}&endDate=${prevEnd}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/approvals/times?startDate=${curStart}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/dashboard/recommendations`, { headers }).then(r => r.json()),
    ])
      .then(([m, pm, v, l, vendorList, prevTimes, curTimes, rec]) => {
        setMeta(m);
        setPrevMeta(pm);
        setVendors(v.topVendors || []);
        setLogs(Array.isArray(l) ? l : []);

        const newAlerts = [];
        if (vendorList?.vendors) {
          const inactive = vendorList.vendors.find(v => v.last_invoice && (Date.now() - new Date(v.last_invoice)) / 86400000 > 30);
          if (inactive) newAlerts.push(`Check in with vendor ${inactive.vendor}?`);
        }
        if (Array.isArray(prevTimes.approvals) && Array.isArray(curTimes.approvals)) {
          const avg = arr => arr.reduce((s,a)=>s+a.hours,0)/(arr.length||1);
          const prevAvg = avg(prevTimes.approvals);
          const curAvg = avg(curTimes.approvals);
          if (prevAvg && curAvg > prevAvg * 1.2) {
            setSuggestion('Average processing time is higher this month. Automate approval steps?');
          }
        }
        setAlerts(newAlerts);
        setRecs(rec || null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    localStorage.setItem('adaptiveCardOrder', JSON.stringify(cardOrder));
  }, [cardOrder]);

  useEffect(() => {
    localStorage.setItem('adaptivePinned', JSON.stringify(Array.from(pinned)));
  }, [pinned]);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const orderedCards = [
      ...cardOrder.filter((c) => pinned.has(c)),
      ...cardOrder.filter((c) => !pinned.has(c)),
    ];
    const sourceIndex = orderedCards.indexOf(active.id);
    const destinationIndex = orderedCards.indexOf(over.id);
    if (sourceIndex === -1 || destinationIndex === -1) return;
    const nextOrder = arrayMove(cardOrder, sourceIndex, destinationIndex);
    setCardOrder(nextOrder);
  };

  const togglePin = (key) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openNewRule = () => {
    setRuleForm({ type: 'spend', amount: 1000 });
    setShowRuleModal(true);
  };

  const saveRule = async (data) => {
    const body =
      data.type === 'spend'
        ? { amountGreaterThan: parseFloat(data.amount), flagReason: `Amount over $${data.amount}` }
        : data.type === 'newVendor'
        ? { newVendor: true, flagReason: 'Vendor not seen before' }
        : data.type === 'pastDue'
        ? { pastDue: true, flagReason: 'Invoice past due' }
        : { duplicateId: true, flagReason: 'Duplicate invoice ID' };
    try {
      await fetch(`${API_BASE}/api/analytics/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
    } catch (e) {
      console.error('Save rule failed:', e);
    }
    setShowRuleModal(false);
  };

  const renderCard = (key) => {
    if (key === 'vendors') {
      return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow space-y-1">
          <div className="text-sm text-gray-500 flex items-center justify-between">
            <span>🚀 Total Vendors</span>
            <div className="flex items-center gap-1">
              {prevMeta && <Sparkline prev={prevMeta.totalVendors} cur={meta?.totalVendors} />}
              <button onClick={() => togglePin('vendors')} aria-label="Pin Vendors">
                {pinned.has('vendors') ? (
                  <StarSolid className="w-4 h-4 text-yellow-400" />
                ) : (
                  <StarOutline className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="text-xl font-semibold flex items-center justify-between">
            <span>{meta?.totalVendors ?? 0}</span>
            {prevMeta && (
              <span className="text-xs">{meta.totalVendors - prevMeta.totalVendors >= 0 ? '▲' : '▼'}</span>
            )}
          </div>
        </div>
      );
    }
    if (key === 'flagged') {
      return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow space-y-1">
          <div className="text-sm text-gray-500 flex items-center justify-between">
            <span>🚩 Flagged Invoices</span>
            <div className="flex items-center gap-1">
              {prevMeta && <Sparkline prev={prevMeta.flaggedItems} cur={meta?.flaggedItems} />}
              <button onClick={() => togglePin('flagged')} aria-label="Pin Flagged">
                {pinned.has('flagged') ? (
                  <StarSolid className="w-4 h-4 text-yellow-400" />
                ) : (
                  <StarOutline className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="text-xl font-semibold flex items-center justify-between">
            <span>{meta?.flaggedItems ?? 0}</span>
            {prevMeta && (
              <span className="text-xs">{meta.flaggedItems - prevMeta.flaggedItems >= 0 ? '▲' : '▼'}</span>
            )}
          </div>
        </div>
      );
    }
    if (key === 'processing') {
      return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow space-y-1">
          <div className="text-sm text-gray-500 flex items-center justify-between">
            <span>⏱ Avg. Processing (hrs)</span>
            <div className="flex items-center gap-1">
              {prevMeta && <Sparkline prev={prevMeta.avgProcessingHours} cur={meta?.avgProcessingHours} />}
              <button onClick={() => togglePin('processing')} aria-label="Pin Processing">
                {pinned.has('processing') ? (
                  <StarSolid className="w-4 h-4 text-yellow-400" />
                ) : (
                  <StarOutline className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div
            className={`text-xl font-semibold flex items-center justify-between ${
              meta && meta.avgProcessingHours <= 24
                ? 'text-green-600'
                : meta && meta.avgProcessingHours > 48
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}
          >
            <span>{meta?.avgProcessingHours ?? 0}</span>
            {prevMeta && (
              <span className="text-xs">{meta.avgProcessingHours - prevMeta.avgProcessingHours >= 0 ? '▲' : '▼'}</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ImprovedMainLayout title="Adaptive Dashboard">
      <div className="space-y-8">
        {alerts.map((a, i) => (
          <div key={i} className="p-3 bg-red-100 text-red-700 rounded-md">
            {a}
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={() => setView('suggestions')} className={`btn px-2 py-1 ${view==='suggestions' ? 'btn-primary' : 'btn-secondary'}`}>AI Suggestions</button>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow flex flex-wrap gap-2">
          <button onClick={openNewRule} className="btn btn-primary">Set New Auto-Flag Rule</button>
          <Link to="/upload-wizard" className="btn btn-secondary">Upload Bulk CSV</Link>
          <Link to="/analytics" className="btn btn-secondary">View Analytics Hub Summary</Link>
        </div>
        {view==='suggestions' && suggestion && (
          <div className="p-3 bg-yellow-100 text-yellow-700 rounded-md">
            {suggestion}
          </div>
        )}
        {view==='suggestions' && recs && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow space-y-2">
            <h2 className="font-semibold">Personalized Recommendations</h2>
            <div className="text-sm font-medium">Top vendors to monitor:</div>
            <ul className="list-disc list-inside text-sm">
              {(recs.topVendors || []).map(v => (
                <li key={v.vendor}>{v.vendor} - ${v.total.toFixed(2)}</li>
              ))}
            </ul>
            {Array.isArray(recs.dueSoon) && recs.dueSoon.length > 0 && (
              <>
                <div className="text-sm font-medium mt-2">Invoices nearing due date:</div>
                <ul className="list-disc list-inside text-sm">
                  {recs.dueSoon.map(inv => (
                    <li key={inv.id}>#{inv.invoice_number} {inv.vendor} due {new Date(inv.due_date).toLocaleDateString()}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="text-sm font-medium mt-2">
              Suggested threshold update: ${recs.suggestedThreshold}
            </div>
          </div>
        )}
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext
            items={[...cardOrder.filter((c) => pinned.has(c)), ...cardOrder.filter((c) => !pinned.has(c))]}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {loading ? (
                <Skeleton rows={1} className="h-20 col-span-2 md:col-span-3" />
              ) : (
                [...cardOrder.filter((c) => pinned.has(c)), ...cardOrder.filter((c) => !pinned.has(c))].map(
                  (key) => (
                    <AdaptiveCard key={key} cardId={key}>
                      {renderCard(key)}
                    </AdaptiveCard>
                  )
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
        <div className="h-64">
          {loading ? (
            <Skeleton rows={1} className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vendors} dataKey="total" nameKey="vendor" outerRadius={80} onClick={(d) => setSelectedVendor(d.vendor)}>
                  {vendors.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Recent Activity</h2>
          <ul className="space-y-1 text-sm">
            {loading ? (
              <Skeleton rows={3} />
            ) : (
              logs.map((log) => (
                <li key={log.id} className="border-b pb-1">
                  <span className="font-medium">{log.username || log.user_id}</span> {log.action}{' '}
                  <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <VendorProfilePanel vendor={selectedVendor} open={!!selectedVendor} onClose={() => setSelectedVendor(null)} token={token} />
        <RuleModal
          open={showRuleModal}
          onClose={() => setShowRuleModal(false)}
          onSave={saveRule}
          initial={ruleForm}
        />
      </div>
    </ImprovedMainLayout>
  );
}
