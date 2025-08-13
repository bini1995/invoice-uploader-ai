import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from './components/Skeleton';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';
import CTAButton from './components/ui/CTAButton';
import { ROLE_EMOJI } from './theme/roles';
import { logEvent } from './lib/analytics';

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
  const [showRoleEmojis, setShowRoleEmojis] = useState(true);
  const { t } = useTranslation();
  const [keys, setKeys] = useState([]);
  const [newLabel, setNewLabel] = useState('');

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
    const res = await fetch(`${API_BASE}/api/logs`, { headers });
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
      setShowRoleEmojis(data.showRoleEmojis ?? true);
      localStorage.setItem('showRoleEmojis', String(data.showRoleEmojis ?? true));
    }
  }, [headers]);

  const fetchKeys = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/api-keys`, { headers });
    const data = await res.json();
    if (res.ok) setKeys(data);
  }, [headers]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([
        fetchUsers(),
        fetchLogs(),
        fetchSettings(),
        fetchKeys()
      ]).finally(() => setLoading(false));
    }
  }, [fetchUsers, fetchLogs, fetchSettings, fetchKeys, token]);

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

  const createKey = async () => {
    const res = await fetch(`${API_BASE}/api/api-keys`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ label: newLabel })
    });
    const data = await res.json();
    if (res.ok) {
      setKeys([...keys, data]);
      setNewLabel('');
      alert(`New key: ${data.api_key}`);
    }
  };

  const updateLabel = async (id, label) => {
    await fetch(`${API_BASE}/api/api-keys/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ label })
    });
  };

  const deleteKey = async (id) => {
    await fetch(`${API_BASE}/api/api-keys/${id}`, { method: 'DELETE', headers });
    setKeys(keys.filter(k => k.id !== id));
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
        showRoleEmojis,
      })
    });
    logEvent('toggle_role_emojis', { enabled: showRoleEmojis });
    localStorage.setItem('showRoleEmojis', String(showRoleEmojis));
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
            {['viewer','admin','adjuster','medical_reviewer','auditor','broker','internal_ops'].map(r => (
              <option key={r} value={r}>{t(`roles.${r}`, r)}</option>
            ))}
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
                    <div className="relative" title={t(`roles.${u.role}`, u.role)}>
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                        alt={u.username}
                        className="h-6 w-6 rounded-full"
                      />
                      {showRoleEmojis && ROLE_EMOJI[u.role] && (
                        <span
                          className="absolute -bottom-1 -right-1 text-xs"
                          role="img"
                          aria-label={`role: ${t(`roles.${u.role}`, u.role)}`}
                        >
                          {ROLE_EMOJI[u.role]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 group">
                    {u.username}
                    {ROLE_EMOJI[u.role] && (
                      <span className="badge ml-1 hidden group-hover:inline group-focus-within:inline">
                        {t(`roles.${u.role}`, u.role)}
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="input p-1">
                      {['viewer','admin','adjuster','medical_reviewer','auditor','broker','internal_ops'].map(r => (
                        <option key={r} value={r}>{t(`roles.${r}`, r)}</option>
                      ))}
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">API Keys</h2>
          <div className="space-y-2">
            {keys.map(k => (
              <div key={k.id} className="flex items-center space-x-2">
                <input
                  className="input flex-1"
                  value={k.label || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setKeys(keys.map(x => (x.id === k.id ? { ...x, label: val } : x)));
                    updateLabel(k.id, val);
                  }}
                  placeholder="Label"
                />
                <span className="font-mono text-xs break-all">{k.api_key}</span>
                <button onClick={() => deleteKey(k.id)} className="text-red-600" title="Delete">
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="flex space-x-2 pt-2">
            <input
              className="input flex-1"
              placeholder="New key label"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
            />
            <button onClick={createKey} className="bg-indigo-600 text-white px-3 py-1 rounded">
              Generate
            </button>
          </div>
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
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={showRoleEmojis} onChange={e => setShowRoleEmojis(e.target.checked)} />
            <span>Show role emojis</span>
          </label>
          <CTAButton onClick={saveSettings} className="px-3 py-1">Save Settings</CTAButton>
        </div>
      </div>
    </MainLayout>
  );
}

export default TeamManagement;
