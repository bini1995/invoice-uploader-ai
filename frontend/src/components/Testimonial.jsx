import React from 'react';

export default function Testimonial() {
  return (
    <section className="py-16 bg-surface motion-safe:animate-fade-in">
      <div className="container mx-auto text-center max-w-2xl">
        <blockquote className="text-xl italic">
          “ClarifyOps cut our claim review time in half without losing oversight.”
        </blockquote>
        <p className="mt-4 text-sm text-muted">Pilot customer</p>
      </div>
    </section>
  );
}

