import React from 'react';
import { Button } from './components/ui/Button';
import LoginLink from './components/LoginLink';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 bg-surface/80 backdrop-blur z-10">
        <nav className="container mx-auto flex items-center justify-between py-4 px-4">
          <a href="/" className="text-xl font-bold">ClarifyOps</a>
          <LoginLink source="security" className="px-4 py-2 border rounded">
            Log in
          </LoginLink>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Security & Privacy</h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Your data security and privacy are our top priorities
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-2">HIPAA Compliance</h3>
              <p className="text-green-700">
                We maintain full HIPAA compliance with administrative, physical, and technical safeguards to protect your PHI.
              </p>
            </div>
            
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">SOC2 Type II</h3>
              <p className="text-blue-700">
                Our systems undergo regular SOC2 Type II audits to ensure security, availability, and confidentiality controls.
              </p>
            </div>
            
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-800 mb-2">HITRUST CSF</h3>
              <p className="text-purple-700">
                HITRUST CSF certification demonstrates our commitment to healthcare industry security standards.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Data Encryption</h3>
              <p className="text-muted">
                All data is encrypted in transit (TLS 1.3) and at rest (AES-256) with industry-standard protocols.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Access Controls</h3>
              <p className="text-muted">
                Role-based access controls, multi-factor authentication, and comprehensive audit logging.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Incident Response</h3>
              <p className="text-muted">
                24/7 monitoring and rapid incident response procedures with transparent communication.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="p-8 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Contact Security Team</h2>
            <p className="text-muted mb-6">
              Have security questions or need to report an issue? Our security team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:security@clarifyops.com"
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
              >
                security@clarifyops.com
              </a>
              <a
                href="tel:+1-555-0123"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                +1 (555) 0123
              </a>
            </div>
          </div>
          
          <div className="text-sm text-muted">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>For detailed compliance documentation, please contact our team.</p>
          </div>
        </div>
      </main>

      <footer className="bg-ink text-surface text-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} ClarifyOps. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 