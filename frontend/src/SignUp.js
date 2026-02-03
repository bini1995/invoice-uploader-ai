import React, { useState } from 'react';
import { Card } from './components/ui/Card';
import { API_BASE } from './api';
import DarkModeToggle from './components/DarkModeToggle';
import HighContrastToggle from './components/HighContrastToggle';
import PageHeader from './components/PageHeader';
import { logEvent, getRequestId } from './lib/analytics';

export default function SignUp({ onLogin, addToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    logEvent('signup_click', { source: 'signup_form', request_id: getRequestId() });
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        onLogin(data.token, data.role);
        addToast('Account created successfully!');
        logEvent('signup_success', { source: 'signup_form', request_id: getRequestId() });
        window.location.href = '/operations';
      } else {
        setError(data.message || 'Sign up failed');
        addToast(data.message || 'Sign up failed', 'error');
        logEvent('signup_error', { source: 'signup_form', reason: data.message || 'error', request_id: getRequestId() });
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Something went wrong. Please try again.');
      addToast('Something went wrong.', 'error');
      logEvent('signup_error', { source: 'signup_form', reason: 'network', request_id: getRequestId() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow p-2 z-20 flex justify-between items-center">
        <a href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="ClarifyOps" className="h-9 w-auto bg-white rounded px-2 py-1" />
        </a>
        <div className="flex items-center gap-2">
          <HighContrastToggle />
          <DarkModeToggle />
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center pt-20">
        <Card className="w-96 space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <PageHeader title="Create Account" subtitle="Start your free trial" />

            {error && (
              <div className="bg-red-100 text-red-700 p-2 text-sm rounded" role="alert">{error}</div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                autoComplete="new-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Log in
              </a>
            </p>
            
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
