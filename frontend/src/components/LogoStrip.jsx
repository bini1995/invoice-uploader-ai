import React from 'react';

export default function LogoStrip() {
  const logos = ['HealthCo', 'MediCorp', 'TrustHealth'];
  return (
    <section className="py-8 bg-surface motion-safe:animate-fade-in">
      <div className="container mx-auto flex justify-center items-center gap-8">
        {logos.map(name => (
          <svg
            key={name}
            width="120"
            height="60"
            viewBox="0 0 120 60"
            role="img"
            aria-label={`${name} logo`}
            className="logo-animate grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition"
          >
            <rect width="120" height="60" rx="8" fill="#E5E7EB" />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#6B7280"
              fontSize="16"
              fontFamily="sans-serif"
            >
              {name}
            </text>
          </svg>
        ))}
      </div>
    </section>
  );
}

