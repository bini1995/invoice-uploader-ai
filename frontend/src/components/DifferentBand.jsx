import React from 'react';

const pillars = [
  {
    title: 'Human-in-the-loop',
    description: 'Reviewers always make the final call.',
  },
  {
    title: 'Built for claims',
    description: 'Medical forms, coding, and compliance first.',
  },
  {
    title: 'Transparent by design',
    description: 'Every action traceable, every insight sourced.',
  },
];

export default function DifferentBand() {
  return (
    <section
      id="why"
      className="py-20 bg-surface motion-safe:animate-fade-in"
    >
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3 text-center">
        {pillars.map(p => (
          <div key={p.title} className="space-y-2">
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <p className="text-sm text-muted">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

