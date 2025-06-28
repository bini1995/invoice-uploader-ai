import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

const DEFAULT_WIDGETS = ['Top Vendors', 'Anomaly Heatmap', 'Approval Timeline'];

export default function DashboardBuilder() {
  const token = localStorage.getItem('token') || '';
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  const [vendors, setVendors] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API_BASE}/api/invoices/top-vendors`, { headers })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) setVendors(d.topVendors || []);
      })
      .catch(() => {});
    fetch(`${API_BASE}/api/invoices/upload-heatmap`, { headers })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) setHeatmap(d.heatmap || []);
      })
      .catch(() => {});
    fetch(`${API_BASE}/api/invoices`)
      .then((r) => r.json())
      .then((list) => {
        if (list && list[0]) {
          const id = list[0].id;
          fetch(`${API_BASE}/api/invoices/${id}/timeline`, { headers })
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data)) setTimeline(data);
              else if (Array.isArray(data.timeline)) setTimeline(data.timeline);
              else setTimeline([]);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [token]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setWidgets(items);
    localStorage.setItem('dashboardLayout', JSON.stringify(items));
  };

  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  let max = 0;
  heatmap.forEach(({ day, hour, count }) => {
    grid[day][hour] = count;
    if (count > max) max = count;
  });

  return (
    <MainLayout title="Dashboard Builder">
      <h1 className="text-xl font-semibold mb-4">Dashboard Builder</h1>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {widgets.map((w, index) => (
                  <Draggable key={w} draggableId={w} index={index}>
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        className="bg-white dark:bg-gray-800 p-4 rounded shadow"
                      >
                        {w === 'Top Vendors' && (
                          <>
                            <h2 className="text-lg font-semibold mb-2">Top Vendors</h2>
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
                          </>
                        )}
                        {w === 'Anomaly Heatmap' && (
                          <>
                            <h2 className="text-lg font-semibold mb-2">Anomaly Heatmap</h2>
                            <table className="table-fixed border-collapse rounded-lg overflow-hidden text-xs">
                              <thead>
                                <tr>
                                  <th></th>
                                  {Array.from({ length: 24 }).map((_, h) => (
                                    <th key={h} className="px-1 font-normal">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {grid.map((row, d) => (
                                  <tr key={d} className="text-center">
                                    <td className="pr-1 font-normal">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</td>
                                    {row.map((c, h) => {
                                      const intensity = max ? Math.round((c / max) * 255) : 0;
                                      const bg = `rgba(220,38,38,${intensity / 255})`;
                                      return <td key={h} style={{ backgroundColor: bg }} className="w-4 h-4"></td>;
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </>
                        )}
                        {w === 'Approval Timeline' && (
                          <>
                            <h2 className="text-lg font-semibold mb-2">Approval Timeline</h2>
                            <ul className="text-sm max-h-48 overflow-y-auto">
                              {Array.isArray(timeline) &&
                                timeline.map((t, i) => (
                                  <li key={i}>
                                    {new Date(t.created_at).toLocaleString()} - {t.action}
                                  </li>
                                ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
    </MainLayout>
  );
}

