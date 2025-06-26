import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from './Skeleton';
import { API_BASE } from '../api';

export default function CashflowSimulation({ token }) {
  const [delay, setDelay] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState([]);

  const runSim = async (d) => {
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
  };

  const fetchScenarios = async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/scenarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setScenarios(data.scenarios || []);
  };

  const saveScenario = async () => {
    if (!token) return;
    await fetch(`${API_BASE}/api/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: `Delay ${delay} days`, delayDays: delay }),
    });
    fetchScenarios();
  };

  useEffect(() => { runSim(delay); }, [delay]);
  useEffect(() => { fetchScenarios(); }, [token]);

  const chartData = () => {
    if (!result) return [];
    const mapScenario = Object.fromEntries(result.scenario.map((s) => [s.date, s.total]));
    return result.baseline.map((b) => ({
      date: b.date,
      baseline: b.total,
      scenario: mapScenario[b.date] ?? b.total,
    }));
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
      <div className="h-64">
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
