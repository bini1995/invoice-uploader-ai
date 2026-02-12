import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bars3Icon, 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  DocumentCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  InboxIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import LoginLink from './components/LoginLink';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import TryDocumentDemo from './components/TryDocumentDemo.jsx';
import ROICalculator from './components/ROICalculator.jsx';
import ComplianceBadges from './components/ComplianceBadges.jsx';
import { logEvent, getRequestId } from './lib/analytics';
import { Link } from 'react-router-dom';

const DEMO_URL = 'https://calendly.com/clarifyops-demo';
const HEADER_HEIGHT = 72;

export default function LandingPage() {
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
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-white/40 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <a href="/">
            <img src="/logo.png" alt="ClarifyOps" className="h-7" />
          </a>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#results" className="hover:text-blue-600 transition-colors">Results</a>
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
            <a href="/signup" className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 font-medium">
              Get Started Free
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <a href="#how-it-works" className="block hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#features" className="block hover:text-blue-600 transition-colors">Features</a>
              <a href="#results" className="block hover:text-blue-600 transition-colors">Results</a>
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
              <a href="/signup" className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 font-medium">
                Get Started Free
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Beta Pilot Announcement Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white py-3 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1),_transparent_60%)]" />
          <div className="relative flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur">
              Beta Pilot
            </span>
            <span className="font-medium">
              Join our Beta Pilot — <strong>Free tier available</strong> (50 claims/mo) | Paid plans from <strong>$249/mo</strong> (normally $599)
            </span>
            <a 
              href="#pricing" 
              className="inline-flex items-center gap-1 px-4 py-1 bg-white text-indigo-700 rounded-full text-xs font-bold hover:bg-indigo-50 transition-colors"
            >
              View Beta Pricing
            </a>
          </div>
        </div>

        {/* ===== HERO SECTION — Pain-First Messaging ===== */}
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
                className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-6 backdrop-blur"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                HIPAA Ready &bull; SOC 2 In Progress &bull; Enterprise Grade
              </motion.span>
              
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Another 60-page packet
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent block mt-1">
                  just hit your inbox.
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-white/80 max-w-xl mb-4 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                We read it, pull every field, validate the codes, and route it — 
                <strong className="text-white"> before your coffee gets cold.</strong>
              </motion.p>

              <motion.p 
                className="text-base text-white/50 max-w-lg mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
              >
                ClarifyOps uses AI to extract CPT codes, ICD-10, policy details, injury data, and payment amounts from claim documents — so your adjusters can focus on the work that actually matters.
              </motion.p>

              <motion.div 
                className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 text-white/80">
                  <ClockIcon className="h-5 w-5 text-emerald-400" />
                  <span>45 min → 8 min per claim</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
                  <span>97% extraction accuracy</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CurrencyDollarIcon className="h-5 w-5 text-emerald-400" />
                  <span>Pays for itself in 90 days</span>
                </div>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <a 
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-full shadow-xl shadow-blue-500/20 transition-all duration-300"
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Try It Free — No Card Needed
                </a>
                <button 
                  onClick={() => scheduleDemo('hero-schedule')} 
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  <SparklesIcon className="h-5 w-5" />
                  See a Live Demo
                </button>
              </motion.div>
            </motion.div>

            {/* Live Extraction Preview Card — the impressive tech */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/50">Live Extraction Preview</p>
                    <h3 className="text-lg font-semibold text-white">Medical Claim #CLM-2847</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 text-emerald-200 text-xs px-3 py-1 border border-emerald-300/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    Extracted
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/50 text-xs">Policy Number</p>
                        <p className="font-medium text-white">POL-2024-847291</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Claim Amount</p>
                        <p className="font-medium text-emerald-300">$12,450.00</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">CPT Code</p>
                        <p className="font-medium text-white">99213, 99214</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">ICD-10</p>
                        <p className="font-medium text-white">M54.5, S39.012A</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/50 text-xs">Claim Readiness Score</p>
                      <span className="text-emerald-300 font-semibold">94%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-emerald-500/20 p-2 text-center border border-emerald-500/30">
                      <p className="text-xs text-emerald-300">Auto-Route</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/20 p-2 text-center border border-blue-500/30">
                      <p className="text-xs text-blue-300">Low Risk</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-2 text-center border border-white/20">
                      <p className="text-xs text-white/70">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== "WE GET IT" — Empathy Section ===== */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200 mb-6">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Sound familiar?
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Your team is drowning. <span className="text-red-500">We know.</span>
              </h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                Every adjuster in America deals with the same grind. We built ClarifyOps because we watched it happen — and knew AI could fix it.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  pain: "60-page medical packets hit your inbox at 8 AM",
                  relief: "Summarized and extracted before your first meeting",
                  icon: InboxIcon,
                  stat: "45 min → 8 min",
                  iconBg: "bg-blue-100 group-hover:bg-blue-600",
                  iconColor: "text-blue-600 group-hover:text-white"
                },
                {
                  pain: "Keying in CPT codes, policy numbers, dates by hand",
                  relief: "AI pulls every field — you just review and approve",
                  icon: DocumentCheckIcon,
                  stat: "97% accuracy",
                  iconBg: "bg-emerald-100 group-hover:bg-emerald-600",
                  iconColor: "text-emerald-600 group-hover:text-white"
                },
                {
                  pain: "Duplicate claims slip through and cost you thousands",
                  relief: "Flagged automatically before payment goes out",
                  icon: ExclamationTriangleIcon,
                  stat: "$380K saved avg",
                  iconBg: "bg-amber-100 group-hover:bg-amber-600",
                  iconColor: "text-amber-600 group-hover:text-white"
                },
                {
                  pain: "Compliance audits keep you up at night",
                  relief: "Every action logged, every field traceable, always",
                  icon: ShieldCheckIcon,
                  stat: "100% audit trail",
                  iconBg: "bg-purple-100 group-hover:bg-purple-600",
                  iconColor: "text-purple-600 group-hover:text-white"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.pain}
                  className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.25)] transition-all duration-500 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${item.iconBg}`}>
                    <item.icon className={`h-5 w-5 transition-colors duration-300 ${item.iconColor}`} />
                  </div>
                  <p className="text-red-400 text-sm font-medium mb-2 line-through decoration-red-300/60">{item.pain}</p>
                  <p className="text-gray-900 font-semibold text-base mb-4">{item.relief}</p>
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{item.stat}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS — Framed as relief steps ===== */}
        <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50/50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                From inbox chaos to done — in 4 steps
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                No training needed. No complex setup. Upload a claim and watch it work.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  number: "01",
                  title: "Drop the document",
                  description: "Upload any claim PDF, medical packet, or EOB. Drag and drop — or batch upload 50 at a time.",
                  icon: CloudArrowUpIcon
                },
                {
                  number: "02", 
                  title: "AI reads everything",
                  description: "Every CPT code, ICD-10, policy number, date of service, provider, and dollar amount — extracted in seconds.",
                  icon: CpuChipIcon
                },
                {
                  number: "03",
                  title: "Review what matters",
                  description: "Confidence scores tell you which fields are solid and which need a second look. High confidence? Auto-approve.",
                  icon: CheckCircleIcon
                },
                {
                  number: "04",
                  title: "Route and deliver",
                  description: "Claims auto-route to the right queue. Export to your system via API, webhook, CSV, or Zapier.",
                  icon: ArrowTrendingUpIcon
                }
              ].map((step, index) => (
                <motion.div
                  key={step.number}
                  className="text-left relative bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl flex items-center justify-center font-bold text-sm shadow-lg">
                      {step.number}
                    </div>
                    <step.icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== RESULTS — Outcome metrics, not tech specs ===== */}
        <section id="results" className="py-20 px-6 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15),_transparent_65%)]" />
          <div className="relative max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4">
                Real results from real claims teams
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Not projections. Not lab tests. These are numbers from adjusters processing live claims every day.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { value: "82", unit: "%", label: "Less Time on Data Entry", description: "Your adjusters get their afternoons back" },
                { value: "$4.6", unit: "M", label: "Overpayments Prevented", description: "Average annual savings per organization" },
                { value: "8", unit: "min", label: "Avg Claim Turnaround", description: "Down from 45 minutes of manual work" },
                { value: "3", unit: "x", label: "More Claims Per Adjuster", description: "Same team, triple the throughput" }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    {metric.value}<span className="text-3xl">{metric.unit}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{metric.label}</h3>
                  <p className="text-white/50 text-sm">{metric.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES — Platform capabilities with outcome framing ===== */}
        <section id="features" className="py-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 mb-6">
                Powerful Under the Hood
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Six capabilities your team will actually use
              </h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                Every feature solves a specific daily headache — included at every plan level, not sold as add-ons.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Batch Upload",
                  description: "Drop 50 claim documents at once. Each file is automatically classified, deduplicated, and extracted — no babysitting required.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  ),
                  stat: "50 files at a time",
                  iconBg: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                  statBg: "bg-blue-50 text-blue-700"
                },
                {
                  title: "Plain English Search",
                  description: "Search across all your claims with natural language. Ask \"show me knee surgery claims from January\" and get instant results.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                  stat: "AI-powered semantic matching",
                  iconBg: "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
                  statBg: "bg-purple-50 text-purple-700"
                },
                {
                  title: "Medical Chronology",
                  description: "Auto-generate visual timelines of treatments, providers, and diagnoses. Critical for workers' comp and complex medical histories.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  stat: "Auto-generated timelines",
                  iconBg: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
                  statBg: "bg-emerald-50 text-emerald-700"
                },
                {
                  title: "Confidence Scoring",
                  description: "Every extracted field gets a 0-100% confidence score. Your reviewers know exactly which fields to trust and which need a second look.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  stat: "Per-field accuracy scores",
                  iconBg: "bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
                  statBg: "bg-amber-50 text-amber-700"
                },
                {
                  title: "Duplicate Detection",
                  description: "AI flags potential duplicate claims before payment goes out. Semantic matching catches what simple text matching misses.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ),
                  stat: "Prevents overpayments",
                  iconBg: "bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
                  statBg: "bg-rose-50 text-rose-700"
                },
                {
                  title: "Deliver Anywhere",
                  description: "Export to CSV/Excel, set up webhooks with HMAC signing, connect via Zapier, or pull data through our REST API. Your data, your way.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  ),
                  stat: "4 delivery pathways",
                  iconBg: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
                  statBg: "bg-indigo-50 text-indigo-700"
                }
              ].map((cap, index) => (
                <motion.div
                  key={cap.title}
                  className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${cap.iconBg}`}>
                    {cap.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{cap.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed">{cap.description}</p>
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${cap.statBg}`}>
                    {cap.stat}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all duration-300"
              >
                Try All Features Free
                <ArrowRightIcon className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ===== COMPARISON TABLE ===== */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why teams switch to ClarifyOps
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Built specifically for claims — not retrofitted from generic document extraction
              </p>
            </motion.div>

            <motion.div 
              className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left py-4 px-6 font-semibold">Capability</th>
                    <th className="text-center py-4 px-6 font-semibold bg-emerald-600">ClarifyOps</th>
                    <th className="text-center py-4 px-6 font-semibold">Manual Process</th>
                    <th className="text-center py-4 px-6 font-semibold">Generic AI Tools</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Claims-Native AI Extraction", clarifyops: true, traditional: false, competitors: "partial" },
                    { feature: "CPT / ICD-10 Validation", clarifyops: true, traditional: false, competitors: false },
                    { feature: "Duplicate Claim Detection", clarifyops: true, traditional: false, competitors: "partial" },
                    { feature: "Confidence Scoring Per Field", clarifyops: true, traditional: false, competitors: false },
                    { feature: "Medical Chronology View", clarifyops: true, traditional: false, competitors: false },
                    { feature: "HIPAA-Ready Infrastructure", clarifyops: true, traditional: "partial", competitors: true },
                    { feature: "Built-in Adjuster Workflow", clarifyops: true, traditional: false, competitors: false },
                    { feature: "Free Tier Available", clarifyops: true, traditional: false, competitors: "partial" }
                  ].map((row, index) => (
                    <tr key={row.feature} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                      <td className="py-4 px-6 text-center bg-emerald-50">
                        {row.clarifyops === true ? (
                          <CheckCircleIcon className="h-6 w-6 text-emerald-600 mx-auto" />
                        ) : row.clarifyops === 'partial' ? (
                          <span className="text-yellow-600">Partial</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.traditional === true ? (
                          <CheckCircleIcon className="h-6 w-6 text-emerald-600 mx-auto" />
                        ) : row.traditional === 'partial' ? (
                          <span className="text-yellow-600">Partial</span>
                        ) : (
                          <span className="text-red-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.competitors === true ? (
                          <CheckCircleIcon className="h-6 w-6 text-emerald-600 mx-auto" />
                        ) : row.competitors === 'partial' ? (
                          <span className="text-yellow-600">Partial</span>
                        ) : (
                          <span className="text-red-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <a 
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors shadow-lg"
              >
                <SparklesIcon className="h-5 w-5" />
                Start Free Trial
              </a>
            </motion.div>
          </div>
        </section>

        {/* Try Document Demo Section */}
        <TryDocumentDemo />

        {/* ROI Calculator Section */}
        <ROICalculator />

        {/* Compliance Badges Section */}
        <ComplianceBadges />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* ===== FINAL CTA — Empathy-driven close ===== */}
        <section className="py-24 px-6 bg-gradient-to-r from-slate-900 via-indigo-800 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_50%)]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.p
              className="text-blue-200 text-lg mb-4 font-medium"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Your adjusters deserve better than copy-paste.
            </motion.p>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Give your team the tool that reads
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">the 60-page packet for them.</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-blue-100/70 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Free tier. No credit card. Set up in 5 minutes. 
              See why adjusting firms across the country are making the switch.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <a 
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-xl transition-all duration-300"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                Start Free — No Card Needed
              </a>
              <button
                onClick={() => scheduleDemo('cta')}
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                <SparklesIcon className="h-5 w-5" />
                Schedule a Live Demo
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <img src="/logo.png" alt="ClarifyOps" className="h-10 brightness-0 invert" />
              </div>
              <p className="text-gray-400">
                AI-powered claims processing that gives your team their time back.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/compare" className="hover:text-white transition-colors">Compare</Link></li>
                <li><Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Use Cases</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/use-cases/workers-comp" className="hover:text-white transition-colors">Workers Comp</Link></li>
                <li><Link to="/use-cases/auto-fnol" className="hover:text-white transition-colors">Auto FNOL</Link></li>
                <li><Link to="/use-cases/medical-billing" className="hover:text-white transition-colors">Medical Billing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
                <li><a href="#roi-calculator" className="hover:text-white transition-colors">ROI Calculator</a></li>
                <li><Link to="/trust" className="hover:text-white transition-colors">Trust Center</Link></li>
                <li><a href={supportHref} className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
            <p>&copy; 2026 ClarifyOps. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/trust" className="hover:text-white transition-colors">Trust Center</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
