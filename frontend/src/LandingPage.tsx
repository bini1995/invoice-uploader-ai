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
      description: "HIPAA-ready architecture with encryption and activity logging",
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
    { value: "85", unit: "%", label: "Faster Processing", description: "vs. manual claim handling" },
    { value: "$4.6", unit: "M", label: "Fraud Blocked", description: "Average annual savings per enterprise" },
    { value: "18", unit: "min", label: "Avg Decision Time", description: "From hours to minutes" },
    { value: "99.9", unit: "%", label: "Accuracy Rate", description: "AI-powered validation" }
  ];

  const painPoints = [
    {
      problem: "Manual data entry takes hours",
      solution: "AI extracts all fields in seconds",
      stat: "85% time saved"
    },
    {
      problem: "Missed fraud costs millions",
      solution: "ML detects anomalies in real-time",
      stat: "$4.6M avg blocked"
    },
    {
      problem: "Compliance audits are stressful",
      solution: "Comprehensive activity logging for every action",
      stat: "100% traceable"
    },
    {
      problem: "Adjusters overwhelmed with backlog",
      solution: "Smart routing & auto-approvals",
      stat: "3x throughput"
    }
  ];

  const competitorComparison = [
    { feature: "AI-Powered Extraction", clarifyops: true, traditional: false, competitors: "partial" },
    { feature: "Real-Time Fraud Detection", clarifyops: true, traditional: false, competitors: "partial" },
    { feature: "Complete Audit Logging", clarifyops: true, traditional: false, competitors: false },
    { feature: "Multi-Tenant Architecture", clarifyops: true, traditional: false, competitors: "partial" },
    { feature: "HIPAA-Ready Architecture", clarifyops: true, traditional: "partial", competitors: true },
    { feature: "No-Code Workflow Builder", clarifyops: true, traditional: false, competitors: false },
    { feature: "Predictive Analytics", clarifyops: true, traditional: false, competitors: "partial" },
    { feature: "Free Trial Available", clarifyops: true, traditional: false, competitors: "partial" }
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
          <a href="/">
            <img src="/logo.png" alt="ClarifyOps" className="h-7" />
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
            <a href="/signup" className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 font-medium">
              Get Started Free
            </a>
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
              Join our Beta Pilot — <strong>Free tier available</strong> (50 claims/mo) | Paid plans from <strong>$99/mo</strong> (normally $499)
            </span>
            <a 
              href="#pricing" 
              className="inline-flex items-center gap-1 px-4 py-1 bg-white text-indigo-700 rounded-full text-xs font-bold hover:bg-indigo-50 transition-colors"
            >
              View Beta Pricing
            </a>
          </div>
        </div>

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
                className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-6 backdrop-blur"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                HIPAA Ready • SOC 2 In Progress • Enterprise Grade
              </motion.span>
              
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                AI Claims Data Extraction
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent block">
                  for Insurance Ops Teams
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Upload claim PDFs → Instantly extract <strong className="text-white">CPT codes, policy details, injury data, payment amounts</strong> → Route claims automatically.
              </motion.p>

              <motion.div 
                className="flex flex-wrap gap-4 mb-8 text-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 text-white/80">
                  <ClockIcon className="h-5 w-5 text-emerald-400" />
                  <span>18 min avg processing</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
                  <span>99.9% extraction accuracy</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CurrencyDollarIcon className="h-5 w-5 text-emerald-400" />
                  <span>$4.6M fraud blocked avg</span>
                </div>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <button 
                  onClick={() => scheduleDemo('hero')} 
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-full shadow-xl shadow-blue-500/20 transition-all duration-300"
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Try Free Demo
                </button>
                <button 
                  onClick={() => scheduleDemo('hero-schedule')} 
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Schedule a Call
                </button>
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

        {/* Technology Partners Section */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <motion.p 
              className="text-center text-gray-500 text-xs uppercase tracking-[0.3em] mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Built With Industry-Leading Technology
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-10 opacity-70 text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.6, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-gray-400">PostgreSQL</div>
                <div className="text-xs text-gray-300">Database</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-400">React</div>
                <div className="text-xs text-gray-300">Frontend</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-400">Node.js</div>
                <div className="text-xs text-gray-300">Backend</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-400">OpenAI</div>
                <div className="text-xs text-gray-300">AI Models</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-400">DigitalOcean</div>
                <div className="text-xs text-gray-300">Infrastructure</div>
              </div>
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

        {/* Platform Capabilities - Competitive Differentiators */}
        <section className="py-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 mb-6">
                What Sets Us Apart
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Built-in capabilities your team actually needs
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Six powerful features designed specifically for insurance operations — included at every plan level, not sold as add-ons.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Batch Upload & Bulk Processing",
                  description: "Upload up to 50 claim documents at once with drag-and-drop. Each file is automatically classified, deduplicated, and extracted — no manual processing needed.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  ),
                  stat: "50 files per batch",
                  iconBg: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                  statBg: "bg-blue-50 text-blue-700"
                },
                {
                  title: "Natural Language Search",
                  description: "Search across all your claims using plain English. Ask questions like 'show me knee surgery claims from January' and get instant, semantically-matched results.",
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
                  description: "Automatically generate visual timelines of treatments, providers, and diagnoses from claim documents. Critical for workers' comp and medical billing review.",
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
                  description: "Every extracted field comes with an AI confidence score (0-100%) so reviewers know exactly which fields need manual verification and which are reliable.",
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
                  description: "AI automatically flags potential duplicate claims using semantic similarity matching and Levenshtein distance analysis. Prevent double payments before they happen.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ),
                  stat: "Automatic fraud prevention",
                  iconBg: "bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
                  statBg: "bg-rose-50 text-rose-700"
                },
                {
                  title: "Complete Data Delivery",
                  description: "Export to CSV/Excel, configure webhooks with HMAC signing, connect via Zapier, or pull data through our REST API. Your claims data, delivered how you want it.",
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
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{cap.description}</p>
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-20 px-6 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30 mb-6">
                The Problem
              </span>
              <h2 className="text-4xl font-bold mb-4">
                Claims processing is <span className="text-red-400">broken</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Insurance teams waste hours on manual data entry, miss fraud patterns, and struggle with compliance audits. Sound familiar?
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {painPoints.map((item, index) => (
                <motion.div
                  key={item.problem}
                  className="relative bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="mb-4">
                    <p className="text-red-400 text-sm font-medium mb-2 line-through opacity-60">{item.problem}</p>
                    <p className="text-emerald-400 text-lg font-semibold">{item.solution}</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-2xl font-bold text-white">{item.stat}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why choose ClarifyOps?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See how we stack up against traditional methods and other solutions
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
                    <th className="text-left py-4 px-6 font-semibold">Feature</th>
                    <th className="text-center py-4 px-6 font-semibold bg-emerald-600">ClarifyOps</th>
                    <th className="text-center py-4 px-6 font-semibold">Traditional</th>
                    <th className="text-center py-4 px-6 font-semibold">Competitors</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorComparison.map((row, index) => (
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
              <button 
                onClick={() => scheduleDemo('comparison')} 
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors shadow-lg"
              >
                <SparklesIcon className="h-5 w-5" />
                Start Free Trial
              </button>
            </motion.div>
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
              <div className="mb-4">
                <img src="/logo.png" alt="ClarifyOps" className="h-10 brightness-0 invert" />
              </div>
              <p className="text-gray-400">
                The future of claims management powered by AI.
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
