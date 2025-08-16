import React, { useEffect, useRef, useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import HeroSection from './components/HeroSection';
import CredibilityBar from './components/CredibilityBar';
import FeatureCards from './components/FeatureCards';
import DifferentBand from './components/DifferentBand';
import LogoStrip from './components/LogoStrip';
import Testimonial from './components/Testimonial';
import OutcomesSecurity from './components/OutcomesSecurity';
import FinalCTA from './components/FinalCTA';
import { Button } from './components/ui/Button';
import LoginLink from './components/LoginLink';
import { logEvent, getRequestId } from './lib/analytics';

const DEMO_URL = 'https://calendly.com/clarifyops/demo';
const HEADER_HEIGHT = 72;

export default function LandingPage() {
  const sentDepth = useRef({});

  const scheduleDemo = source => {
    logEvent('demo_click', { source, request_id: getRequestId() });
    window.open(DEMO_URL, '_blank', 'noopener');
  };

  const scrollToId = id => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = (scrollTop / docHeight) * 100;
      [25, 50, 75, 100].forEach(depth => {
        if (!sentDepth.current[depth] && percent >= depth) {
          logEvent('scroll_depth', { depth });
          sentDepth.current[depth] = true;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const firstMenuItemRef = useRef(null);

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    if (menuOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) firstMenuItemRef.current?.focus();
  }, [menuOpen]);

  const supportHref = (() => {
    const reqId = getRequestId();
    const body = encodeURIComponent(`Request ID: ${reqId}\nUser-Agent: ${navigator.userAgent}`);
    return `mailto:support@clarifyops.com?subject=${encodeURIComponent('Login/Access')}&body=${body}`;
  })();

  return (
    <div className="flex flex-col min-h-screen bg-surface text-ink">
      <a
        href="#hero-cta"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-surface focus:text-ink focus:p-2 focus:rounded"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 bg-surface/80 backdrop-blur z-10">
        <nav className="container mx-auto flex items-center justify-between py-4 px-4 relative">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.svg" 
              alt="ClarifyOps" 
              className="h-8 w-auto"
              width="160"
              height="64"
            />
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#product" className="hover:underline">Product</a>
            <a href="#why" className="hover:underline">Why us</a>
            <a href="#security" className="hover:underline">Security</a>
            <a href="#contact" className="hover:underline">Contact</a>
            {token ? (
              <a
                href="/app"
                className="flex items-center gap-2 px-4 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cta"
              >
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=user&backgroundColor=E5E7EB&textColor=111827"
                  alt="avatar"
                  className="h-6 w-6 rounded-full"
                />
                <span>Go to app</span>
              </a>
            ) : (
              <Button variant="outline" asChild className="px-4 py-2">
                <LoginLink source="header" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cta">
                  Log in
                </LoginLink>
              </Button>
            )}
            <Button onClick={() => scheduleDemo('nav')} className="px-4 py-2">
              Schedule a demo
            </Button>
          </div>
          <button
            ref={menuButtonRef}
            className="md:hidden p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cta"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          {menuOpen && (
            <div className="md:hidden absolute right-4 top-full mt-2 bg-surface border rounded shadow-lg flex flex-col p-4 gap-2 text-sm">
              <a ref={firstMenuItemRef} href="#product" className="hover:underline" onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}>Product</a>
              <a href="#why" className="hover:underline" onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}>Why us</a>
              <a href="#security" className="hover:underline" onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}>Security</a>
              <a href="#contact" className="hover:underline" onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}>Contact</a>
              {token ? (
                <a
                  href="/app"
                  className="flex items-center gap-2 px-4 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cta"
                  onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}
                >
                  <img
                    src="https://api.dicebear.com/7.x/initials/svg?seed=user&backgroundColor=E5E7EB&textColor=111827"
                    alt="avatar"
                    className="h-6 w-6 rounded-full"
                  />
                  <span>Go to app</span>
                </a>
              ) : (
                <LoginLink
                  source="header"
                  className="px-4 py-2 border rounded text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cta"
                  onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}
                >
                  Log in
                </LoginLink>
              )}
              <Button onClick={() => { scheduleDemo('nav'); setMenuOpen(false); menuButtonRef.current?.focus(); }} className="px-4 py-2">
                Schedule a demo
              </Button>
            </div>
          )}
        </nav>
      </header>

      <main id="main" className="flex-1">
        <HeroSection
          onRequestDemo={() => scheduleDemo('hero')}
          onHowItWorks={() => {
            logEvent('how_it_works_click');
            scrollToId('how-it-works');
          }}
        />
        <CredibilityBar />
        <FeatureCards />
        <DifferentBand />
        <LogoStrip />
        <Testimonial />
        <OutcomesSecurity />
        <FinalCTA onRequestDemo={() => scheduleDemo('final')} />
      </main>

      <footer className="bg-ink text-surface text-sm">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} ClarifyOps</p>
          <nav className="flex gap-4 justify-center">
            <a href="#privacy" className="hover:text-accent">Privacy</a>
            <a href="#security" className="hover:text-accent">Security</a>
          </nav>
          <p className="text-center sm:text-right">
            Already a customer?{' '}
            <LoginLink source="footer" className="underline hover:text-accent">
              Log in
            </LoginLink>
            {' '}·{' '}
            <a href={supportHref} className="underline hover:text-accent">Contact support</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

