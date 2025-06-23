import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

function TeamManagement() {
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [autoArchive, setAutoArchive] = useState(true);
  const [emailTone, setEmailTone] = useState('professional');
  const [csvLimit, setCsvLimit] = useState(5);
  const [pdfLimit, setPdfLimit] = useState(10);
  const [defaultRetention, setDefaultRetention] = useState('forever');

  const headers = useMemo(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchUsers = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/users`, { headers });
    const data = await res.json();
    if (res.ok) setUsers(data);
  }, [headers]);

  const fetchLogs = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/invoices/logs`, { headers });
    const data = await res.json();
    if (res.ok) setLogs(data);
  }, [headers]);

  const fetchSettings = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/settings`, { headers });
    const data = await res.json();
    if (res.ok) {
      setAutoArchive(data.autoArchive);
      setEmailTone(data.emailTone);
      setCsvLimit(data.csvSizeLimitMB);
      setPdfLimit(data.pdfSizeLimitMB);
      if (data.defaultRetention) setDefaultRetention(data.defaultRetention);
    }
  }, [headers]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([fetchUsers(), fetchLogs(), fetchSettings()]).finally(() => setLoading(false));
    }
  }, [fetchUsers, fetchLogs, fetchSettings, token]);

  const addUser = async () => {
    await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password, role: newRole })
    });
    setUsername('');
    setPassword('');
    setNewRole('viewer');
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE', headers });
    fetchUsers();
  };

  const changeRole = async (id, role) => {
    await fetch(`${API_BASE}/api/users/${id}/role`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role })
    });
    fetchUsers();
  };

  const saveSettings = async () => {
    await fetch(`${API_BASE}/api/settings`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        autoArchive,
        emailTone,
        csvSizeLimitMB: Number(csvLimit),
        pdfSizeLimitMB: Number(pdfLimit),
        defaultRetention,
      })
    });
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Access denied.</p>
      </div>
    );
  }

  return (
    <MainLayout title="Team Management" helpTopic="team">
      <div className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="input w-full" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="input w-full" />
          <select value={newRole} onChange={e => setNewRole(e.target.value)} className="input w-full">
            <option value="viewer">viewer</option>
            <option value="approver">approver</option>
            <option value="admin">admin</option>
          </select>
          <button onClick={addUser} className="bg-indigo-600 text-white px-3 py-1 rounded" title="Add User">Add User</button>
        </div>
        <div className="overflow-x-auto rounded-lg mt-4">
        <table className="w-full text-left border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-2">Avatar</th>
              <th className="p-2">Username</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="p-4"><Skeleton rows={5} height="h-4" /></td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-100">
                  <td className="p-2">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                      alt={u.username}
                      className="h-6 w-6 rounded-full"
                    />
                  </td>
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">
                    <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="input p-1">
                      <option value="viewer">viewer</option>
                      <option value="approver">approver</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <button onClick={() => deleteUser(u.id)} className="text-red-600" title="Remove">Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Activity Logs</h2>
          <ul className="max-h-64 overflow-y-auto text-sm">
            {loading ? (
              <Skeleton rows={3} height="h-4" />
            ) : (
              logs.map(log => (
                <li key={log.id}>{new Date(log.created_at).toLocaleString()} - {log.action} (user {log.user_id})</li>
              ))
            )}
          </ul>
        </div>
        <div className="border rounded p-4 space-y-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={autoArchive} onChange={e => setAutoArchive(e.target.checked)} />
            <span>Auto-archive old invoices</span>
          </label>
          <label className="block">Email tone
            <select value={emailTone} onChange={e => setEmailTone(e.target.value)} className="input w-full mt-1">
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="assertive">Assertive</option>
            </select>
          </label>
          <label className="block">CSV size limit (MB)
            <input type="number" className="input w-full mt-1" value={csvLimit} onChange={e => setCsvLimit(e.target.value)} />
          </label>
          <label className="block">PDF size limit (MB)
            <input type="number" className="input w-full mt-1" value={pdfLimit} onChange={e => setPdfLimit(e.target.value)} />
          </label>
          <label className="block">Default retention
            <select value={defaultRetention} onChange={e=>setDefaultRetention(e.target.value)} className="input w-full mt-1">
              <option value="3mo">3 months</option>
              <option value="1yr">1 year</option>
              <option value="forever">Forever</option>
            </select>
          </label>
          <button onClick={saveSettings} className="bg-indigo-600 text-white px-3 py-1 rounded">Save Settings</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default TeamManagement;
