import React from 'react';
import { Button } from './ui/Button';
import LoginLink from './LoginLink';
import DashboardIllustration from './DashboardIllustration';
import TypingText from './TypingText';

export default function HeroSection({ onRequestDemo, onHowItWorks }) {
  return (
    <section
      id="product"
      className="relative bg-surface text-ink px-6 py-16 overflow-hidden motion-safe:animate-fade-in"
    >
      {/* Hero Video Background */}
      <video
        src="/hero-demo.mp4"
        className="hero-video absolute inset-0 w-full h-full object-cover -z-20 hidden md:block"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/hero-poster.jpg"
        aria-hidden="true"
      />
      <img
        src="/hero-poster.jpg"
        alt=""
        width="1200"
        height="675"
        className="hero-poster absolute inset-0 w-full h-full object-cover -z-20 md:hidden"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/40 -z-10" aria-hidden="true" />
      
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 text-center md:text-left">
          <div className="text-4xl md:text-5xl font-bold">
            <h1 className="sr-only">AI-native claims data extractor</h1>
            <div aria-hidden="true" className="text-ink">
              <TypingText text="AI-native claims data extractor" />
            </div>
          </div>
          <p className="text-lg text-muted max-w-xl mx-auto md:mx-0">
            <span className="sr-only">Extract, validate, and audit medical claims faster.</span>
            <span aria-hidden="true" className="block">
              <TypingText
                text="Extract, validate, and audit medical claims faster."
                speed={50}
              />
            </span>
          </p>
          
          {/* Credibility Strip */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              HIPAA-ready
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              SOC2-aligned
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Built by claims + AI folks
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button id="hero-cta" onClick={onRequestDemo} size="lg">
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

