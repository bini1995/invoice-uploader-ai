import React, { useEffect, useRef } from 'react';
import HeroSection from './components/HeroSection';
import CredibilityBar from './components/CredibilityBar';
import FeatureCards from './components/FeatureCards';
import DifferentBand from './components/DifferentBand';
import LogoStrip from './components/LogoStrip';
import Testimonial from './components/Testimonial';
import OutcomesSecurity from './components/OutcomesSecurity';
import FinalCTA from './components/FinalCTA';
import { Button } from './components/ui/Button';
import { logEvent } from './lib/analytics';

const DEMO_URL = 'https://calendly.com/clarifyops/demo';
const HEADER_HEIGHT = 72;

export default function LandingPage() {
  const sentDepth = useRef({});

  const scheduleDemo = source => {
    logEvent('demo_click', { source });
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

  return (
    <div className="flex flex-col min-h-screen bg-surface text-ink">
      <a
        href="#hero-cta"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-surface focus:text-ink focus:p-2 focus:rounded"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 bg-surface/80 backdrop-blur z-10">
        <nav className="container mx-auto flex items-center justify-between py-4 px-4">
          <a href="/" className="text-xl font-bold">ClarifyOps</a>
          <div className="flex items-center gap-6 text-sm">
            <a href="#product" className="hover:underline">Product</a>
            <a href="#why" className="hover:underline">Why us</a>
            <a href="#security" className="hover:underline">Security</a>
            <a href="#contact" className="hover:underline">Contact</a>
            <Button onClick={() => scheduleDemo('nav')} className="px-4 py-2">
              Schedule a demo
            </Button>
          </div>
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
        </div>
      </footer>
    </div>
  );
}

