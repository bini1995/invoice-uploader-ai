// src/Login.js
import React, { useState } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { Card } from './components/ui/Card';

export default function Login({ onLogin, addToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.token, data.role);
        addToast('Logged in!');
      } else {
        setError(data.message || 'Login failed');
        addToast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong.');
      addToast('Something went wrong.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow p-4 z-20">
        <h1 className="text-xl font-bold flex items-center space-x-1">
          <DocumentArrowUpIcon className="w-5 h-5" />
          <span>Invoice Uploader AI</span>
        </h1>
      </nav>
      <div className="flex-1 flex items-center justify-center pt-20">
        <Card className="w-80 space-y-4">
          <h1 className="text-xl font-bold text-center">Login</h1>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 text-sm rounded">{error}</div>
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input w-full mb-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full mb-4"
          />

          <button onClick={handleLogin} className="btn btn-primary w-full" title="Log In">
            Log In
          </button>
        </Card>
      </div>
    </div>
  );
}
