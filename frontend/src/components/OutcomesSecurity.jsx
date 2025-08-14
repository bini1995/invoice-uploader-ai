import React from 'react';

export default function OutcomesSecurity() {
  return (
    <section
      id="security"
      className="py-20 bg-surface motion-safe:animate-fade-in"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-2xl font-bold">Faster reviews</h3>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Fewer denials</h3>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Audit-ready</h3>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <span>HIPAA</span>
          <span>SOC2</span>
        </div>
        <div className="mt-4 text-center">
          <a
            href="/security"
            className="text-sm underline text-muted hover:text-ink"
          >
            Security & Privacy
          </a>
        </div>
      </div>
    </section>
  );
}

