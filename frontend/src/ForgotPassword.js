import React, { useState } from 'react';
import { Card } from './components/ui/Card';
import { API_BASE } from './api';
import PageHeader from './components/PageHeader';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Unable to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow p-2 z-20 flex justify-between items-center">
        <a href="/" className="hover:opacity-80 transition-opacity font-bold text-xl tracking-tight">
          <span className="text-white">CLARIFY</span><span className="text-purple-300">OPS</span>
        </a>
      </nav>
      <div className="flex-1 flex items-center justify-center pt-20">
        <Card className="w-96 space-y-4">
          <PageHeader title="ClarifyOps" subtitle="Reset Password" />

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded-lg">
                <p className="font-medium">Check your email</p>
                <p className="text-sm mt-2">
                  If an account exists with that email, we've sent password reset instructions.
                </p>
              </div>
              <a 
                href="/login" 
                className="inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Back to Login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {error && (
                <div className="bg-red-100 text-red-700 p-3 text-sm rounded" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  required
                  autoComplete="email"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loading || !email}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <a 
                href="/login" 
                className="block text-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Back to Login
              </a>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
