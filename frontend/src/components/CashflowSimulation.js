import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from './Skeleton';
import { API_BASE } from '../api';

export default function CashflowSimulation({ token }) {
  const [delay, setDelay] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const chartRef = useRef(null);

  const runSim = useCallback(async (d) => {
    if (!token) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/invoices/cash-flow/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ delayDays: d }),
    });
    const data = await res.json();
    if (res.ok) setResult(data);
    setLoading(false);
  }, [token]);

  const fetchScenarios = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/scenarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setScenarios(data.scenarios || []);
  }, [token]);

  const saveScenario = async () => {
    if (!token) return;
    await fetch(`${API_BASE}/api/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: `Delay ${delay} days`, delayDays: delay }),
    });
    fetchScenarios();
  };

  useEffect(() => {
    runSim(delay);
  }, [delay, runSim]);
  useEffect(() => {
    fetchScenarios();
  }, [token, fetchScenarios]);

  useEffect(() => {
    if (!result) return;
    const startingCash = 100000;
    const mapBase = Object.fromEntries(result.baseline.map(b => [b.date, b.total]));
    const mapScenario = Object.fromEntries(result.scenario.map(s => [s.date, s.total]));
    const dates = Array.from(new Set([...result.baseline.map(b => b.date), ...result.scenario.map(s => s.date)])).sort();
    let cumBase = startingCash;
    let cumScen = startingCash;
    let dip = 0;
    for (const d of dates) {
      cumBase -= mapBase[d] || 0;
      cumScen -= mapScenario[d] || 0;
      const diff = cumScen - cumBase;
      if (diff < dip) dip = diff;
    }
    const burn = result.baseline.reduce((a, b) => a + b.total, 0) / (result.baseline.length || 1);
    const scenBurn = result.scenario.reduce((a, b) => a + b.total, 0) / (result.scenario.length || 1);
    const daysLeft = scenBurn ? Math.floor(startingCash / scenBurn) : 0;
    setMetrics({ cashDip: Math.abs(dip), burnRate: burn, daysToZero: daysLeft });
  }, [result]);

  const chartData = () => {
    if (!result) return [];
    const mapScenario = Object.fromEntries(result.scenario.map((s) => [s.date, s.total]));
    return result.baseline.map((b) => ({
      date: b.date,
      baseline: b.total,
      scenario: mapScenario[b.date] ?? b.total,
    }));
  };

  const exportPDF = () => {
    if (!chartRef.current) return;
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open('', '', 'width=800,height=600');
    if (win) {
      win.document.write(`<img src="${url}" onload="window.print();window.close();" />`);
      win.document.close();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="-30"
          max="30"
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value, 10))}
        />
        <span className="text-sm">{delay} days</span>
        <button
          onClick={saveScenario}
          className="px-2 py-1 rounded bg-indigo-600 text-white text-sm"
        >
          Save
        </button>
      </div>
      <div className="h-64" ref={chartRef}>
        {loading || !result ? (
          <Skeleton rows={1} className="h-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="baseline" stroke="#10B981" />
              <Line type="monotone" dataKey="scenario" stroke="#EF4444" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      {metrics && (
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>{`Projected dip: $${metrics.cashDip.toFixed(2)}`}</div>
          <div>{`Burn rate: $${metrics.burnRate.toFixed(2)}/day`}</div>
          <div>{`Days to 0: ${metrics.daysToZero}`}</div>
        </div>
      )}
      <div>
        <button onClick={exportPDF} className="btn btn-primary btn-xs mt-1">Export PDF</button>
      </div>
      {scenarios.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Saved Scenarios</h3>
          <ul className="space-y-1 text-sm">
            {scenarios.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    setDelay(s.delay_days);
                    runSim(s.delay_days);
                  }}
                  className="underline text-blue-600"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
