// src/Login.js
import React, { useState } from 'react';
import { Card } from './components/ui/Card';
import { API_BASE } from './api';
import DarkModeToggle from './components/DarkModeToggle';
import HighContrastToggle from './components/HighContrastToggle';
import PageHeader from './components/PageHeader';

export default function Login({ onLogin, addToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/claims/login`, {
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
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow p-2 z-20 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center space-x-1">
          <img src="/logo.png" alt="logo" className="h-5 w-5" />
          <span>AI Claims Data Extractor</span>
        </h1>
        <div className="flex items-center gap-2">
          <HighContrastToggle />
          <DarkModeToggle />
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center pt-20">
        <Card className="w-80 space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
          <PageHeader title="AI Claims Data Extractor / Dashboard" subtitle="Login" />

          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 text-sm rounded" role="alert">{error}</div>
          )}

          <label htmlFor="username" className="sr-only">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input w-full mb-3"
          />

          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full mb-4"
          />
          <button type="submit" className="btn btn-primary w-full" title="Log In">
            Log In
          </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
