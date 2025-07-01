import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import MainLayout from './components/MainLayout';
import Skeleton from './components/Skeleton';
import VendorProfilePanel from './components/VendorProfilePanel';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

export default function AdaptiveDashboard() {
  const token = localStorage.getItem('token') || '';
  const [meta, setMeta] = useState(null);
  const [prevMeta, setPrevMeta] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [recs, setRecs] = useState(null);
  const [cardOrder, setCardOrder] = useState(() => {
    const saved = localStorage.getItem('adaptiveCardOrder');
    return saved ? JSON.parse(saved) : ['vendors', 'flagged', 'processing'];
  });
  const [pinned, setPinned] = useState(() => {
    const saved = localStorage.getItem('adaptivePinned');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

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
      fetch(`${API_BASE}/api/invoices/top-vendors`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/invoices/cash-flow?interval=monthly`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/invoices/logs?limit=20`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/invoices/fraud/flagged`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/vendors`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/approvals/times?startDate=${prevStart}&endDate=${prevEnd}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/approvals/times?startDate=${curStart}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/dashboard/recommendations`, { headers }).then(r => r.json()),
    ])
      .then(([m, pm, v, c, l, flagged, vendorList, prevTimes, curTimes, rec]) => {
        setMeta(m);
        setPrevMeta(pm);
        setVendors(v.topVendors || []);
        setCashFlow(c.data || []);
        setLogs(Array.isArray(l) ? l : []);

        const newAlerts = [];
        if (Array.isArray(flagged.invoices)) {
          const counts = {};
          flagged.invoices.forEach(inv => {
            const month = inv.date?.slice(0,7);
            if (month) counts[month] = (counts[month] || 0) + 1;
          });
          const months = Object.keys(counts).sort();
          const len = months.length;
          if (len >= 2) {
            const last = counts[months[len-1]];
            const prev = counts[months[len-2]] || 0;
            if (prev && last > prev * 1.5) {
              newAlerts.push('Spike alert: flagged invoices up sharply');
            }
          }
        }
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(cardOrder);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setCardOrder(items);
  };

  const togglePin = (key) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
    <MainLayout title="Adaptive Dashboard">
      <div className="space-y-8">
        {alerts.map((a, i) => (
          <div key={i} className="p-3 bg-red-100 text-red-700 rounded-md">
            {a}
          </div>
        ))}
        {suggestion && (
          <div className="p-3 bg-yellow-100 text-yellow-700 rounded-md">
            {suggestion}
          </div>
        )}
        {recs && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow space-y-2">
            <h2 className="font-semibold">Personalized Recommendations</h2>
            <div className="text-sm font-medium">Top vendors to monitor:</div>
            <ul className="list-disc list-inside text-sm">
              {recs.topVendors.map(v => (
                <li key={v.vendor}>{v.vendor} - ${v.total.toFixed(2)}</li>
              ))}
            </ul>
            {recs.dueSoon.length > 0 && (
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="cards" direction="horizontal">
            {(provided) => (
              <div
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {loading ? (
                  <Skeleton rows={1} className="h-20 col-span-2 md:col-span-3" />
                ) : (
                  [...cardOrder.filter((c) => pinned.has(c)), ...cardOrder.filter((c) => !pinned.has(c))].map(
                    (key, index) => (
                      <Draggable key={key} draggableId={key} index={index}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                            {renderCard(key)}
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
        <div className="h-64">
          {loading ? (
            <Skeleton rows={1} className="h-full" />
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
      </div>
    </MainLayout>
  );
}
