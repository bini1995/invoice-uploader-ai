import React from 'react';

export default function LogoStrip() {
  const verticals = [
    { name: 'Payers', icon: '🏥' },
    { name: 'TPAs', icon: '📋' },
    { name: 'Self-insured employers', icon: '🏢' },
    { name: 'Provider groups', icon: '👨‍⚕️' },
  ];

  return (
    <section className="py-12 bg-surface motion-safe:animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-muted mb-4">Trusted by healthcare organizations</h3>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {verticals.map(({ name, icon }) => (
            <div
              key={name}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-muted hover:text-ink transition-colors"
            >
              <span className="text-lg">{icon}</span>
              <span className="font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

