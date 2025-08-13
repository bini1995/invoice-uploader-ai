import React, { useState } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { Stethoscope } from 'lucide-react';
import { Button } from './components/ui/Button';
import { logEvent } from './lib/analytics';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    const spamTrap = e.target.elements.company?.value;
    if (spamTrap) return;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    try {
      const res = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
      setEmail('');
      logEvent('landing_form_submit', { status: 'success' });
    } catch (err) {
      console.error('form submit failed', err);
      setError('Something went wrong. Please try again.');
      logEvent('landing_form_submit', { status: 'error' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-ink">
      <header className="py-12 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Streamline medical claims review</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
          Upload, audit and approve claims with AI assistance.
        </p>
        {submitted ? (
          <p role="status" className="text-green-700">Thanks! We'll be in touch.</p>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input flex-1"
              placeholder="you@example.com"
              aria-label="Email address"
            />
            <input type="text" name="company" className="hidden" tabIndex="-1" autoComplete="off" />
            <Button type="submit" className="px-6">Request Demo</Button>
          </form>
        )}
        {error && <p className="text-red-600 mt-2" role="alert">{error}</p>}
        {!submitted && (
          <p className="text-xs text-muted mt-2">
            By submitting you agree to our <a href="#privacy" className="underline">Privacy Policy</a>.
          </p>
        )}
      </header>

      <section aria-label="Proof points" className="bg-gray-50 py-4">
        <div className="container mx-auto flex flex-wrap justify-center gap-6 text-center">
          <div>
            <p className="font-bold">-42% review time</p>
            <p className="text-xs text-muted">internal pilot 2024</p>
          </div>
          <div>
            <p className="font-bold">HIPAA-ready</p>
            <p className="text-xs text-muted">arch security review</p>
          </div>
          <div>
            <p className="font-bold">p50 turnaround 2.1h</p>
            <p className="text-xs text-muted">claims dataset Q1</p>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
          <img
            src="https://placehold.co/600x400/webp?text=App+Dashboard"
            srcSet="https://placehold.co/300x200/webp?text=App+Dashboard 300w, https://placehold.co/600x400/webp?text=App+Dashboard 600w"
            sizes="(max-width: 768px) 100vw, 600px"
            alt="App dashboard screenshot"
            className="rounded-lg shadow-lg"
            loading="lazy"
            width="600" height="400"
          />
          <ul className="space-y-4">
            <li className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-600" aria-hidden="true"/>
              Fast digital intake
            </li>
            <li className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-emerald-600" aria-hidden="true"/>
              Built for medical review
            </li>
            <li className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-600" aria-hidden="true"/>
              Audit trails and exports
            </li>
          </ul>
        </section>

        <section id="how" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">How it works</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <span className="text-2xl font-bold text-emerald-600">1</span>
                <p className="mt-2">Upload claim</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-600">2</span>
                <p className="mt-2">Review with AI</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-600">3</span>
                <p className="mt-2">Approve & export</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">Security & Compliance</h2>
          <p className="text-center max-w-2xl mx-auto text-muted">
            HIPAA-ready architecture with encrypted storage and audit trails.
          </p>
        </section>

        <section id="pricing" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
            <p className="text-muted mb-6">Start with a free demo and upgrade as you grow.</p>
            <Button asChild className="px-8"><a href="/login">Get Started</a></Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 text-sm">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} ClarifyClaims</p>
          <nav className="flex gap-4 justify-center">
            <a href="#privacy" className="hover:text-white">Privacy</a>
            <a href="#security" className="hover:text-white">Security</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
