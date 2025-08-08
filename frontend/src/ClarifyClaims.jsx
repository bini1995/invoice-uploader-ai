import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from './components/MainLayout';
import StatCard from './components/StatCard.jsx';
import { Card } from './components/ui/Card';
import { API_BASE } from './api';
import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import Skeleton from './components/Skeleton';

export default function ClarifyClaims() {
  const token = localStorage.getItem('token') || '';
  const [range, setRange] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const { from, to } = useMemo(() => {
    const toDate = new Date();
    const fromDate = new Date();
    if (range === '24h') fromDate.setDate(toDate.getDate() - 1);
    else if (range === '7d') fromDate.setDate(toDate.getDate() - 7);
    else if (range === '30d') fromDate.setDate(toDate.getDate() - 30);
    toDate.setSeconds(0, 0);
    fromDate.setSeconds(0, 0);
    return { from: fromDate.toISOString(), to: toDate.toISOString() };
  }, [range]);

  const fetcher = (url) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
      r.json()
    );

  const { data, error, isLoading, mutate } = useSWR(
    token ? [`${API_BASE}/api/claims/metrics?from=${from}&to=${to}`, token] : null,
    ([url]) => fetcher(url),
    { refreshInterval: 60000, revalidateOnFocus: true }
  );

  useEffect(() => {
    const handler = () => mutate();
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [mutate]);

  useEffect(() => {
    if (data) setLastUpdated(new Date());
  }, [data]);

  const total = data?.total ?? 0;
  const percentFlagged = data
    ? `${(data.flagged_rate * 100).toFixed(1)}%`
    : '0%';
  const avgProcessing = data
    ? `${data.avg_processing_hours.toFixed(1)}h`
    : '0h';
  const statusBreakdown = data?.status_counts || {};

  const drillToQueue = (opts = {}) => {
    const params = new URLSearchParams({ from, to });
    if (opts.flagged) params.set('flagged', 'true');
    if (opts.status) params.set('status', opts.status);
    navigate(`/opsclaim?${params.toString()}`);
  };

  return (
    <MainLayout title="ClarifyClaims">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">ClarifyClaims Summary</h1>
        <div className="flex items-center gap-2 text-sm">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border rounded p-1"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7d</option>
            <option value="30d">Last 30d</option>
          </select>
          <button onClick={() => mutate()} className="text-indigo-600">
            Refresh
          </button>
          {lastUpdated && (
            <span className="ml-auto text-gray-500">
              Last updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm rounded flex items-center gap-2">
            <span>Failed to load metrics.</span>
            <button onClick={() => mutate()} className="underline">
              Retry
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
            title="Total Claims"
            value={isLoading ? <Skeleton rows={1} className="w-16" /> : total}
            onClick={() => drillToQueue()}
          />
          <StatCard
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            title="% Flagged"
            value={isLoading ? <Skeleton rows={1} className="w-16" /> : percentFlagged}
            onClick={() => drillToQueue({ flagged: true })}
          />
          <StatCard
            icon={<ClockIcon className="w-6 h-6" />}
            title="Avg. Processing Time"
            value={
              isLoading ? <Skeleton rows={1} className="w-16" /> : avgProcessing
            }
          />
        </div>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <ChartPieIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold">Claim Status Breakdown</h2>
          </div>
          <ul className="text-sm">
            {isLoading && <Skeleton rows={3} />}
            {!isLoading &&
              Object.entries(statusBreakdown).map(([s, count]) => (
                <li key={s}>
                  <button
                    onClick={() => drillToQueue({ status: s })}
                    className="hover:underline"
                  >
                    {s}: {count}
                  </button>
                </li>
              ))}
            {!isLoading && !Object.keys(statusBreakdown).length && <li>No data</li>}
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}
