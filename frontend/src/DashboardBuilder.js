import React, { useState, useEffect, useMemo } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
} from 'recharts';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import Skeleton from './components/Skeleton';
import PageHeader from './components/PageHeader';
import { API_BASE } from './api';
import { useTimelineStore } from './store/useTimelineStore';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

// Demo fallbacks for empty API responses
const DEMO_VENDORS = [
  { vendor: 'Vendor A', total: 23 },
  { vendor: 'Vendor B', total: 17 },
  { vendor: 'Vendor C', total: 9 },
];

const DEMO_TIMELINE = [
  {
    created_at: '2024-07-01T09:00:00Z',
    action: 'Invoice DEMO-1 uploaded',
  },
  {
    created_at: '2024-07-02T15:30:00Z',
    action: 'Invoice DEMO-1 approved',
  },
  {
    created_at: '2024-07-03T11:45:00Z',
    action: 'Payment processed',
  },
];

const DEFAULT_WIDGETS = ['Top Vendors', 'Anomaly Heatmap', 'Approval Timeline'];

function WidgetCard({ widgetId, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widgetId });
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

export default function DashboardBuilder() {
  const token = localStorage.getItem('token') || '';
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  const [vendors, setVendors] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [activeClaimId, setActiveClaimId] = useState(null);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);
  const { timelineByClaim, statusByClaim, fetchTimeline, setTimeline } = useTimelineStore();
  const timeline = useMemo(() => {
    if (!activeClaimId) return [];
    return timelineByClaim[activeClaimId] || [];
  }, [activeClaimId, timelineByClaim]);
  const loadingTimeline = activeClaimId ? statusByClaim[activeClaimId] === 'loading' : true;

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    setLoadingVendors(true);
    fetch(`${API_BASE}/api/claims/top-vendors`, { headers })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && Array.isArray(d.topVendors) && d.topVendors.length) {
          setVendors(d.topVendors);
        } else {
          setVendors(DEMO_VENDORS);
        }
      })
      .catch(() => setVendors(DEMO_VENDORS))
      .finally(() => setLoadingVendors(false));

    setLoadingHeatmap(true);
    fetch(`${API_BASE}/api/claims/upload-heatmap`, { headers })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) setHeatmap(d.heatmap || []);
        else setHeatmap([]);
      })
      .catch(() => setHeatmap([]))
      .finally(() => setLoadingHeatmap(false));

    fetch(`${API_BASE}/api/claims`)
      .then((r) => r.json())
      .then((list) => {
        if (list && list[0]) {
          const id = list[0].id;
          setActiveClaimId(id);
          fetchTimeline({ claimId: id, token, fallbackTimeline: DEMO_TIMELINE });
        } else {
          setActiveClaimId('demo');
          setTimeline('demo', DEMO_TIMELINE);
        }
      })
      .catch(() => {
        setActiveClaimId('demo');
        setTimeline('demo', DEMO_TIMELINE);
      });
  }, [fetchTimeline, setTimeline, token]);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const sourceIndex = widgets.indexOf(active.id);
    const destinationIndex = widgets.indexOf(over.id);
    if (sourceIndex === -1 || destinationIndex === -1) return;
    const items = arrayMove(widgets, sourceIndex, destinationIndex);
    setWidgets(items);
    localStorage.setItem('dashboardLayout', JSON.stringify(items));
  };

  const heatData = [];
  let max = 0;
  heatmap.forEach(({ day, hour, count }) => {
    heatData.push({ day, hour, count });
    if (count > max) max = count;
  });

  return (
    <ImprovedMainLayout title="Dashboard Builder">
      <PageHeader title="ClarifyOps › ClarifyClaims" subtitle="Create Your Dashboard" />
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={widgets} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 sm:space-y-6">
              {widgets.map((w) => (
                <WidgetCard key={w} widgetId={w}>
                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-4">
                    {w === 'Top Vendors' && (
                      <>
                        <h2 className="text-base sm:text-lg font-semibold mb-2">Top Vendors</h2>
                        {loadingVendors ? (
                          <Skeleton rows={1} className="h-40" />
                        ) : vendors.length === 0 ? (
                          <p className="text-center text-sm text-gray-400 italic">No vendor data yet. Upload documents to get started.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
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
                      </>
                    )}
                    {w === 'Anomaly Heatmap' && (
                      <>
                        <h2 className="text-base sm:text-lg font-semibold mb-2">Anomaly Heatmap</h2>
                        {loadingHeatmap ? (
                          <Skeleton rows={7} className="h-32" />
                        ) : heatData.length === 0 ? (
                          <p className="text-center text-sm text-gray-400 italic">No upload activity yet.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <ScatterChart margin={{ top: 10, right: 10 }}>
                              <XAxis type="number" dataKey="hour" domain={[0, 23]} tickCount={6} />
                              <YAxis type="number" dataKey="day" domain={[0, 6]} tickFormatter={(d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Scatter data={heatData} shape={({ cx, cy, payload }) => (
                                <rect
                                  x={cx - 8}
                                  y={cy - 8}
                                  width={16}
                                  height={16}
                                  rx={2}
                                  ry={2}
                                  fill={`rgba(220,38,38,${max ? payload.count / max : 0})`}
                                />
                              )} />
                            </ScatterChart>
                          </ResponsiveContainer>
                        )}
                      </>
                    )}
                    {w === 'Approval Timeline' && (
                      <>
                        <h2 className="text-base sm:text-lg font-semibold mb-2">Approval Timeline</h2>
                        {loadingTimeline ? (
                          <Skeleton rows={3} className="h-32" />
                        ) : !Array.isArray(timeline) || timeline.length === 0 ? (
                          <p className="text-sm text-gray-500">No approval events yet.</p>
                        ) : (
                          <ul className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-4 text-sm max-h-48 sm:max-h-56 overflow-y-auto">
                            {timeline.map((t, i) => (
                              <li key={i} className="mb-2 ml-2">
                                <span className="absolute -left-2 top-1 w-3 h-3 bg-indigo-500 rounded-full"></span>
                                {new Date(t.created_at).toLocaleString()} - {t.action}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                </WidgetCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
    </ImprovedMainLayout>
  );
}
