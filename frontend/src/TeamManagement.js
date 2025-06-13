import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function TeamManagement() {
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:3000/api/users', { headers });
    const data = await res.json();
    if (res.ok) setUsers(data);
  };

  const fetchLogs = async () => {
    const res = await fetch('http://localhost:3000/api/invoices/logs', { headers });
    const data = await res.json();
    if (res.ok) setLogs(data);
  };

  useEffect(() => { if (token) { fetchUsers(); fetchLogs(); } }, [token]);

  const addUser = async () => {
    await fetch('http://localhost:3000/api/users', {
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
    await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE', headers });
    fetchUsers();
  };

  const changeRole = async (id, role) => {
    await fetch(`http://localhost:3000/api/users/${id}/role`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role })
    });
    fetchUsers();
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <nav className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Team Management</h1>
        <Link to="/" className="text-indigo-600 underline">Back to App</Link>
      </nav>
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
              <th className="p-2">Username</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-100">
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
            ))}
          </tbody>
        </table>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Activity Logs</h2>
          <ul className="max-h-64 overflow-y-auto text-sm">
            {logs.map(log => (
              <li key={log.id}>{new Date(log.created_at).toLocaleString()} - {log.action} (user {log.user_id})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TeamManagement;
