import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bars3Icon, 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CogIcon,
  SparklesIcon,
  BoltIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  PlayIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Button } from './components/ui/Button';
import LoginLink from './components/LoginLink';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import { logEvent, getRequestId } from './lib/analytics';

const DEMO_URL = 'https://calendly.com/taddessebi95/clarifyops-demo';
const HEADER_HEIGHT = 72;

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [, setIsVideoPlaying] = useState(false);

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

  const features = [
    {
      icon: CpuChipIcon,
      title: "AI-Powered Fraud Detection",
      description: "Advanced machine learning algorithms detect suspicious patterns with high accuracy",
      color: "blue",
      highlight: "High Accuracy"
    },
    {
      icon: BoltIcon,
      title: "Real-Time Processing",
      description: "Process claims faster with our intelligent AI engine",
      color: "green",
      highlight: "Fast Processing"
    },
    {
      icon: LockClosedIcon,
      title: "Enterprise-Grade Security",
      description: "HIPAA and GDPR compliant with end-to-end encryption",
      color: "purple",
      highlight: "HIPAA Ready"
    },
    {
      icon: ChartBarIcon,
      title: "Predictive Analytics",
      description: "AI-driven insights help identify optimization opportunities across the claims lifecycle",
      color: "orange",
      highlight: "Actionable Insights"
    },
    {
      icon: GlobeAltIcon,
      title: "Multi-Tenant Architecture",
      description: "Enterprise-grade scalability supporting high-volume operations",
      color: "indigo",
      highlight: "Scalable"
    },
    {
      icon: CloudArrowUpIcon,
      title: "Comprehensive Audit Trails",
      description: "Complete transparency with every action logged for compliance",
      color: "emerald",
      highlight: "Auditable"
    }
  ];

  const metrics = [
    { value: "24", unit: "hr", label: "Average Processing Time", description: "Faster than industry standard" },
    { value: "99.9", unit: "%", label: "Uptime SLA", description: "Enterprise-grade reliability" },
    { value: "90", unit: "+", label: "NPS Score", description: "Industry-leading satisfaction" },
    { value: "0.1", unit: "%", label: "System Error Rate", description: "Highly reliable infrastructure" }
  ];

  const processSteps = [
    {
      number: "01",
      title: "Intelligent Document Upload",
      description: "AI instantly extracts and validates all claim data with precision",
      icon: CloudArrowUpIcon,
      color: "blue"
    },
    {
      number: "02", 
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze risk, validate coverage, and assist in settlement calculation",
      icon: CpuChipIcon,
      color: "green"
    },
    {
      number: "03",
      title: "Automated Workflows",
      description: "Smart routing and approval processes significantly reduce manual overhead",
      icon: CogIcon,
      color: "purple"
    },
    {
      number: "04",
      title: "Real-Time Reporting",
      description: "Live dashboards and analytics provide instant insights for operational clarity",
      icon: ChartBarIcon,
      color: "orange"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-white/40 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="ClarifyOps" 
              className="h-8 w-auto"
            />
          </a>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#metrics" className="hover:text-blue-600 transition-colors">Performance</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            {token ? (
              <a
                href="/app"
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <SparklesIcon className="h-4 w-4" />
                Go to Dashboard
              </a>
            ) : (
              <LoginLink source="header" className="block px-4 py-2 border border-gray-300 rounded-full text-center hover:bg-gray-50">
                Log in
              </LoginLink>
            )}
            <Button onClick={() => scheduleDemo('nav')} className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="block hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#metrics" className="block hover:text-blue-600 transition-colors">Performance</a>
              <a href="#pricing" className="block hover:text-blue-600 transition-colors">Pricing</a>
              {token ? (
                <a
                  href="/app"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Go to Dashboard
                </a>
              ) : (
                <LoginLink source="header" className="block px-4 py-2 border border-gray-300 rounded-full text-center hover:bg-gray-50">
                  Log in
                </LoginLink>
              )}
              <Button onClick={() => scheduleDemo('nav')} className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-slate-950 text-white py-24 px-6 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(99,102,241,0.2),_transparent_55%)]" />
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.span 
                className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/10 mb-6 backdrop-blur"
                whileHover={{ scale: 1.05 }}
              >
                <StarIcon className="h-4 w-4 mr-2 text-amber-300" />
                YC Alumni • Backed by Microsoft & AWS
              </motion.span>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Intelligent claims
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent block">
                  operations platform
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-white/90 max-w-2xl mb-12 leading-relaxed font-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                ClarifyOps pairs <strong className="text-white font-semibold italic">enterprise-grade AI</strong> with automated workflows to process claims in minutes, not days.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-start mb-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  onClick={() => scheduleDemo('hero')} 
                  className="bg-white text-slate-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-full shadow-xl shadow-blue-500/20 transition-all duration-300"
                >
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Schedule a Demo
                </Button>
                <Button 
                  variant="outline" 
                  className="border border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div 
                className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-white/60"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {["HIPAA Compliant", "99.9% Uptime", "GDPR Ready"].map(item => (
                  <div key={item} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/50">Live Command Center</p>
                    <h3 className="text-xl font-semibold text-white">Claims Intelligence</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 text-emerald-200 text-xs px-3 py-1 border border-emerald-300/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    Real-time
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70">Auto-approved claims</p>
                        <p className="text-2xl font-semibold text-white">1,248</p>
                      </div>
                      <ArrowTrendingUpIcon className="h-8 w-8 text-blue-300" />
                    </div>
                    <p className="text-xs text-white/50 mt-3">+32% this month</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
                      <p className="text-xs text-white/50">Avg. decision time</p>
                      <p className="text-lg font-semibold text-white">18 mins</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
                      <p className="text-xs text-white/50">Fraud blocked</p>
                      <p className="text-lg font-semibold text-white">$4.6M</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon className="h-6 w-6 text-blue-200" />
                      <div>
                        <p className="text-sm font-medium text-white">AI risk scoring</p>
                        <p className="text-xs text-white/60">Prioritize highest-impact claims instantly.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Logos Section */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <motion.p 
              className="text-center text-gray-500 text-xs uppercase tracking-[0.3em] mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Trusted by leading teams worldwide
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 opacity-70 text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.6, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Add actual company logos here */}
              <div className="text-2xl font-bold text-gray-400">Y Combinator</div>
              <div className="text-2xl font-bold text-gray-400">Microsoft</div>
              <div className="text-2xl font-bold text-gray-400">AWS</div>
              <div className="text-2xl font-bold text-gray-400">OpenAI</div>
              <div className="text-2xl font-bold text-gray-400">Anthropic</div>
            </motion.div>
          </div>
        </section>

        {/* Performance Metrics Section */}
        <section id="metrics" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Performance that speaks for itself
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our AI-powered platform delivers results that far exceed industry standards
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="text-center p-8 rounded-2xl bg-white/80 border border-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] hover:shadow-[0_30px_70px_-35px_rgba(59,130,246,0.45)] transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {metric.value}<span className="text-2xl">{metric.unit}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{metric.label}</h3>
                  <p className="text-gray-600 text-sm">{metric.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything you need to process claims faster
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From intelligent document processing to automated fraud detection, we've built the complete claims management platform.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="text-left p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] hover:border-blue-200 hover:shadow-[0_30px_70px_-35px_rgba(59,130,246,0.45)] transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-100`}>
                    <feature.icon className={`h-6 w-6 text-slate-600`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800`}>
                    {feature.highlight}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How ClarifyOps Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform streamlines the entire claims lifecycle with intelligent automation and AI-powered insights.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  className="text-left relative bg-white/80 border border-white rounded-2xl p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-semibold text-sm shadow-lg">
                      {step.number}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500">Step {step.number}</p>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-slate-900 via-indigo-700 to-blue-700">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to transform your claims process?
            </motion.h2>
            <motion.p 
              className="text-xl text-blue-100 mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join leading insurance companies who trust ClarifyOps to process claims faster, reduce costs, and improve customer satisfaction.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                onClick={() => scheduleDemo('cta')} 
                className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
              >
                Schedule a Demo
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold rounded-full"
              >
                View Pricing
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/logo.svg" alt="ClarifyOps" className="h-8 w-auto mb-4" />
              <p className="text-gray-400">
                The future of claims management powered by AI.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href={supportHref} className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ClarifyOps. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
