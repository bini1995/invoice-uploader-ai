import React from 'react';

export default function OutcomesSecurity() {
  return (
    <section
      id="security"
      className="py-20 bg-surface motion-safe:animate-fade-in"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Proven outcomes</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Real results from healthcare organizations using our platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-accent mb-2">Faster</div>
            <h3 className="text-xl font-semibold mb-2">Processing speed</h3>
            <p className="text-sm text-muted">Reduce claim review time significantly</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-accent mb-2">Fewer</div>
            <h3 className="text-xl font-semibold mb-2">Claim denials</h3>
            <p className="text-sm text-muted">Catch errors before submission</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-accent mb-2">Audit-ready</div>
            <h3 className="text-xl font-semibold mb-2">Compliance logs</h3>
            <p className="text-sm text-muted">Complete trail of every action</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-green-800">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-blue-800">SOC2 Type II</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-purple-800">HITRUST CSF</span>
            </div>
          </div>
          <a
            href="/security"
            className="text-sm underline text-muted hover:text-ink transition-colors"
          >
            View our security & privacy posture →
          </a>
        </div>
      </div>
    </section>
  );
}

