import React, { useEffect, useRef, useState } from 'react';
import { Bars3Icon, CheckCircleIcon, ShieldCheckIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { Button } from './components/ui/Button';
import LoginLink from './components/LoginLink';
import { logEvent, getRequestId } from './lib/analytics';

const DEMO_URL = 'https://calendly.com/clarifyops/demo';
const HEADER_HEIGHT = 72;

export default function LandingPage() {
  const sentDepth = useRef({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const scheduleDemo = source => {
    logEvent('demo_click', { source, request_id: getRequestId() });
    window.open(DEMO_URL, '_blank', 'noopener');
  };

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const supportHref = (() => {
    const reqId = getRequestId();
    const body = encodeURIComponent(`Request ID: ${reqId}\nUser-Agent: ${navigator.userAgent}`);
    return `mailto:support@clarifyops.com?subject=${encodeURIComponent('Login/Access')}&body=${body}`;
  })();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur z-50 border-b border-gray-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="ClarifyOps" 
              className="h-8 w-auto"
            />
          </a>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            {token ? (
              <a
                href="/app"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Go to Dashboard</span>
              </a>
            ) : (
              <LoginLink source="header" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Log in
              </LoginLink>
            )}
            <Button onClick={() => scheduleDemo('nav')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
            <a href="#features" className="block hover:text-blue-600">Features</a>
            <a href="#how-it-works" className="block hover:text-blue-600">How it Works</a>
            <a href="#pricing" className="block hover:text-blue-600">Pricing</a>
            {token ? (
              <a href="/app" className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center">
                Go to Dashboard
              </a>
            ) : (
              <LoginLink source="header" className="block px-4 py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
                Log in
              </LoginLink>
            )}
            <Button onClick={() => scheduleDemo('nav')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
                🚀 Y Combinator Alumni
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of
                <span className="text-blue-600 block">Claims Management</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                ClarifyOps is an InsurTech shaping the future of claims. We combine advanced AI with a best-in-class team to manage the entire claims process for insurance companies—from receiving a claim to making coverage decisions and issuing payments.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button onClick={() => scheduleDemo('hero')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg">
                Schedule a Demo
              </Button>
              <Button variant="outline" className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg">
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything you need to process claims faster
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From intelligent document processing to automated fraud detection, we've built the complete claims management platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-gray-50">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">AI-Powered Fraud Detection</h3>
                <p className="text-gray-600">
                  Advanced machine learning algorithms detect suspicious patterns and flag potential fraud in real-time.
                </p>
              </div>

              <div className="text-center p-8 rounded-xl bg-gray-50">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Real-Time Analytics</h3>
                <p className="text-gray-600">
                  Comprehensive dashboards and reporting tools to track performance and optimize your claims process.
                </p>
              </div>

              <div className="text-center p-8 rounded-xl bg-gray-50">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CogIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Automated Workflows</h3>
                <p className="text-gray-600">
                  Customizable workflows that automatically route claims and trigger actions based on your business rules.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How ClarifyOps Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform streamlines the entire claims lifecycle with intelligent automation and AI-powered insights.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
                <p className="text-gray-600">
                  Simply upload claim documents and our AI instantly extracts all relevant information.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  Our AI analyzes each claim for accuracy, completeness, and potential fraud indicators.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Routing</h3>
                <p className="text-gray-600">
                  Claims are automatically routed to the right team members based on complexity and type.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  4
                </div>
                <h3 className="text-lg font-semibold mb-2">Fast Processing</h3>
                <p className="text-gray-600">
                  Process claims up to 10x faster with automated approvals and instant payments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to transform your claims process?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join leading insurance companies who trust ClarifyOps to process millions of claims efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => scheduleDemo('final')} className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg">
                Start Free Trial
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo.svg" alt="ClarifyOps" className="h-8 w-auto mb-4" />
              <p className="text-gray-400">
                Shaping the future of claims management with advanced AI and best-in-class technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href={supportHref} className="hover:text-white">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 ClarifyOps. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

