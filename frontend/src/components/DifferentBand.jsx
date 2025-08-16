import React from 'react';

const pillars = [
  {
    title: 'Human-in-the-loop',
    description: 'Reviewers always make the final call.',
    icon: (
      <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Claims-first design',
    description: 'Medical forms, coding, and compliance first.',
    icon: (
      <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Transparent by default',
    description: 'Every action traceable, every insight sourced.',
    icon: (
      <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function DifferentBand() {
  return (
    <section
      id="why"
      className="py-20 bg-gray-50 motion-safe:animate-fade-in"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why we're different</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Built specifically for healthcare claims processing with industry expertise
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 text-center">
          {pillars.map(p => (
            <div key={p.title} className="space-y-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center">
                {p.icon}
              </div>
              <h3 className="text-xl font-bold text-ink">{p.title}</h3>
              <p className="text-sm text-muted">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

