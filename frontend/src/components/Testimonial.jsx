import React from 'react';

export default function Testimonial() {
  return (
    <section className="py-16 bg-surface motion-safe:animate-fade-in">
      <div className="container mx-auto text-center max-w-2xl">
        <blockquote className="text-xl italic">
          “ClarifyOps cut our review time in half while keeping auditors happy.”
        </blockquote>
        <p className="mt-4 text-sm text-muted">Jane Doe, Claims Director</p>
      </div>
    </section>
  );
}

