import React, { useState, useEffect } from 'react';
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
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/sso/status`)
      .then(res => res.json())
      .then(data => setGoogleEnabled(data.google))
      .catch(() => {});
  }, []);

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
          <img src="/logo.png" alt="ClarifyOps" className="h-7 brightness-0 invert" />
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

            {googleEnabled && (
              <>
                <a
                  href="/api/auth/google"
                  className="flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 font-medium"
                  onClick={() => logEvent('signup_click', { source: 'signup_page', request_id: getRequestId(), method: 'google' })}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </a>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
                  </div>
                </div>
              </>
            )}

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
