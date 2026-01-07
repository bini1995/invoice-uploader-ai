// src/Login.js
import React, { useState } from 'react';
import { Card } from './components/ui/Card';
import { API_BASE } from './api';
import DarkModeToggle from './components/DarkModeToggle';
import HighContrastToggle from './components/HighContrastToggle';
import PageHeader from './components/PageHeader';
import { logEvent, getRequestId } from './lib/analytics';

export default function Login({ onLogin, addToast, next }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const ssoEnabled = localStorage.getItem('sso_enabled') === 'true';
  const loginUrl = `${API_BASE}/api/claims/login`;

  const handleLogin = async () => {
    logEvent('login_click', { source: 'login_form', request_id: getRequestId(), method: 'password' });
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.token, data.role);
        addToast('Logged in!');
        logEvent('login_success', { source: 'login_form', method: 'password', request_id: getRequestId() });
      } else {
        setError(data.message || 'Login failed');
        addToast(data.message || 'Login failed', 'error');
        logEvent('login_error', { source: 'login_form', method: 'password', reason: data.message || 'error', request_id: getRequestId() });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong.');
      addToast('Something went wrong.', 'error');
      logEvent('login_error', { source: 'login_form', method: 'password', reason: 'network', request_id: getRequestId() });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow p-2 z-20 flex justify-between items-center">
        <a href="/" className="text-xl font-bold flex items-center space-x-1 hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="ClarifyOps logo" className="h-7 w-auto" />
          <span>ClarifyClaims</span>
        </a>
        <div className="flex items-center gap-2">
          <HighContrastToggle />
          <DarkModeToggle />
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center pt-20">
        <Card className="w-80 space-y-4">
          {ssoEnabled && (
            <>
              <a
                href={`/sso-login?next=${encodeURIComponent(next)}`}
                className="btn btn-primary w-full text-center"
                onClick={() => logEvent('login_click', { source: 'login_page', request_id: getRequestId(), method: 'sso' })}
              >
                Sign in with SSO
              </a>
              <div className="text-center text-sm text-muted">or</div>
            </>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <PageHeader title="ClarifyOps › ClarifyClaims" subtitle="Login" />

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
            <a href="/forgot-password" className="block text-center text-sm underline mt-2">Forgot password?</a>
            {!ssoEnabled && (
              <a
                href={`/sso-login?next=${encodeURIComponent(next)}`}
                className="block text-center text-sm underline"
                onClick={() => logEvent('login_click', { source: 'login_page', request_id: getRequestId(), method: 'sso' })}
              >
                Sign in with SSO
              </a>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
