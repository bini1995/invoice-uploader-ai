import React from 'react';
import { Button } from './ui/Button';
import LoginLink from './LoginLink';
import DashboardIllustration from './DashboardIllustration';

export default function HeroSection({ onRequestDemo, onHowItWorks }) {
  return (
    <section
      id="product"
      className="bg-surface text-ink px-6 py-20 motion-safe:animate-fade-in"
    >
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-bold">
            AI-native claims data extractor
          </h1>
          <p className="text-xl text-muted max-w-xl mx-auto md:mx-0">
            Extract, validate, and audit medical claims faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button id="hero-cta" onClick={onRequestDemo} className="px-8 py-3">
              Schedule a demo
            </Button>
            <a
              href="#how-it-works"
              className="self-center text-muted hover:text-ink underline"
              onClick={e => {
                e.preventDefault();
                onHowItWorks();
              }}
            >
              See how it works
            </a>
          </div>
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <LoginLink
              source="hero"
              className="underline hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cta"
            >
              Log in
            </LoginLink>
          </p>
        </div>
        <DashboardIllustration />
      </div>
    </section>
  );
}

