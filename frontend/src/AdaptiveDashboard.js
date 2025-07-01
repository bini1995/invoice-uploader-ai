import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MainLayout from './components/MainLayout';
import Skeleton from './components/Skeleton';
import VendorProfilePanel from './components/VendorProfilePanel';
import { API_BASE } from './api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

export default function AdaptiveDashboard() {
  const token = localStorage.getItem('token') || '';
  const [meta, setMeta] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    const now = new Date();
    const curStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0,10);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0,10);

    Promise.all([
      fetch(`${API_BASE}/api/analytics/metadata`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/invoices/top-vendors`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/invoices/cash-flow?interval=monthly`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/invoices/logs?limit=20`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/invoices/fraud/flagged`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/vendors`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/approvals/times?startDate=${prevStart}&endDate=${prevEnd}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics/approvals/times?startDate=${curStart}`, { headers }).then(r => r.json()),
    ])
      .then(([m, v, c, l, flagged, vendorList, prevTimes, curTimes]) => {
        setMeta(m);
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
      })
      .finally(() => setLoading(false));
  }, [token]);

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? (
            <Skeleton rows={1} className="h-20 col-span-2 md:col-span-3" />
          ) : (
            <>
              <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="text-sm text-gray-500">🚀 Total Vendors</div>
                <div className="text-xl font-semibold">{meta?.totalVendors ?? 0}</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="text-sm text-gray-500">🚩 Flagged Invoices</div>
                <div className="text-xl font-semibold">{meta?.flaggedItems ?? 0}</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="text-sm text-gray-500">⏱ Avg. Processing (hrs)</div>
                <div className="text-xl font-semibold">{meta?.avgProcessingHours ?? 0}</div>
              </div>
            </>
          )}
        </div>
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
