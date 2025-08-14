import React from 'react';
import { Button } from './ui/Button';

export default function FinalCTA({ onRequestDemo }) {
  return (
    <section className="py-20 text-center bg-surface motion-safe:animate-fade-in">
      <p className="text-2xl font-semibold mb-6">Ready to see it in action?</p>
      <Button onClick={onRequestDemo} className="px-8 py-3">
        Schedule a demo
      </Button>
    </section>
  );
}

