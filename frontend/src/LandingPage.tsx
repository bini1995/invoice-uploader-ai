import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bars3Icon, 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  CloudArrowUpIcon,
  DocumentCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  EyeIcon,
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

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [sampleStep, setSampleStep] = useState(0);

  const scheduleDemo = (source) => {
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
            <a href="#what-you-get" className="hover:text-blue-600 transition-colors">What You Get</a>
            <a href="#who-its-for" className="hover:text-blue-600 transition-colors">Who It's For</a>
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
              Start Free
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
              <a href="#what-you-get" className="block hover:text-blue-600 transition-colors">What You Get</a>
              <a href="#who-its-for" className="block hover:text-blue-600 transition-colors">Who It's For</a>
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
                Start Free
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Pilot Banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wide text-emerald-300 border border-emerald-500/30">
              Early Pilot
            </span>
            <span className="font-medium">
              Send us one anonymized claim file — <strong>we'll process it and send back the results</strong>
            </span>
            <a 
              href="mailto:bini@clarifyops.com?subject=Pilot%20File&body=I%27d%20like%20to%20send%20an%20anonymized%20file%20for%20processing."
              className="inline-flex items-center gap-1 px-4 py-1 bg-white text-slate-800 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              Send a File
            </a>
          </div>
        </div>

        {/* ===== HERO — Literal workday moment ===== */}
        <section className="relative bg-slate-950 text-white py-20 md:py-28 px-6 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.15),_transparent_55%)]" />
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.h1 
                className="text-4xl md:text-[3.5rem] font-bold mb-6 leading-[1.12] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Stop reading
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent"> 60-page claim packets.</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-white/75 max-w-xl mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Send the file. Get an adjuster-ready claim packet in ~2 minutes.
              </motion.p>

              <motion.div 
                className="flex flex-col gap-3 mb-8 text-[15px]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="flex items-center gap-2.5 text-white/80">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>Policy, claimant, and loss details extracted</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/80">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>CPT/ICD validated automatically</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/80">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>Duplicate & billing issues flagged</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/80">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>Adjuster reviews instead of transcribes</span>
                </div>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <a 
                  href="mailto:bini@clarifyops.com?subject=Sample%20Claim&body=I%27d%20like%20to%20send%20a%20sample%20claim%20file%20—%20please%20return%20the%20prepared%20report."
                  onClick={() => logEvent('cta_send_file', { source: 'hero' })}
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-full shadow-xl shadow-blue-500/20 transition-all duration-300"
                >
                  Send a Sample Claim
                  <ArrowRightIcon className="h-5 w-5" />
                </a>
                <a 
                  href="#sample-claim"
                  onClick={() => logEvent('cta_sample_claim', { source: 'hero' })}
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  <EyeIcon className="h-5 w-5" />
                  See a Sample Result
                </a>
              </motion.div>
            </motion.div>

            {/* Prepared Claim Preview — shows the OUTPUT, not the tech */}
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
                    <p className="text-xs uppercase tracking-widest text-white/40">Adjuster-Ready Claim Packet</p>
                    <h3 className="text-lg font-semibold text-white">Ready to send</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 text-emerald-200 text-xs px-3 py-1 border border-emerald-300/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    Review-Ready
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                    <p className="text-white/40 text-xs mb-2 font-medium">First-Pass Summary</p>
                    <p className="text-white/90 text-sm leading-relaxed">Casualty claim for lumbar sprain following MVA on 11/15/2024. Claimant treated at Midwest Ortho, 3 visits. Total billed $12,450. CPT 99213, 99214 validated. No duplicate flags. Claim readiness: high.</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/40 text-xs">Policy</p>
                        <p className="font-medium text-white">POL-2024-847291</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Billed Amount</p>
                        <p className="font-medium text-emerald-300">$12,450.00</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">CPT Codes</p>
                        <p className="font-medium text-white">99213, 99214 <span className="text-emerald-400 text-xs">valid</span></p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">ICD-10</p>
                        <p className="font-medium text-white">M54.5, S39.012A</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs">Claim Readiness</p>
                      <span className="text-emerald-300 font-semibold text-sm">94%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-emerald-500/20 p-2 text-center border border-emerald-500/30">
                      <p className="text-xs text-emerald-300">No Duplicates</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/20 p-2 text-center border border-blue-500/30">
                      <p className="text-xs text-blue-300">Codes Valid</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-2 text-center border border-white/20">
                      <p className="text-xs text-white/70">Ready to Route</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== SECTION 2 — BEFORE vs AFTER (visceral, not explanatory) ===== */}
        <section id="how-it-works" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                A 60-page claim file lands in the inbox. Then what?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <motion.div 
                className="rounded-2xl border-2 border-red-100 bg-red-50/30 p-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold text-red-900 mb-6">Without ClarifyOps</h3>
                <ol className="space-y-5">
                  {[
                    "Assignment email received",
                    "Adjuster opens 60-page packet",
                    "Scans pages, pulls details by hand",
                    "Types the first summary",
                    "Then begins adjusting"
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <span className="text-base">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-sm text-red-800/60 mt-6 pt-4 border-t border-red-200">45+ minutes before the real work begins</p>
              </motion.div>

              <motion.div 
                className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 p-8"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold text-emerald-900 mb-6">With ClarifyOps</h3>
                <ol className="space-y-5">
                  {[
                    "Assignment email received",
                    "Drop into ClarifyOps",
                    "Prepared report returned",
                    "Adjuster starts adjusting"
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <span className="text-base font-medium">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-sm text-emerald-800 font-medium mt-6 pt-4 border-t border-emerald-200">Your adjuster still makes every decision. ClarifyOps just does the prep.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 3 — WHAT THEY ACTUALLY RECEIVE (Output Artifacts) ===== */}
        <section id="what-you-get" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50/50">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What your adjusters actually receive
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Not a dashboard to learn. Not a system to configure. These are the outputs waiting in your queue every morning.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Prepared Claim Summary",
                  description: "Every key field extracted and organized: policy numbers, claimant info, dates of service, providers, billed amounts, and injury details. Your adjuster opens a ready-made brief, not a stack of papers.",
                  detail: "Includes per-field confidence scores so reviewers know exactly what to trust and what to double-check.",
                  icon: DocumentTextIcon,
                  iconBg: "bg-blue-100 text-blue-600",
                },
                {
                  title: "Medical Chronology",
                  description: "A clean timeline of treatments, providers, and diagnoses pulled directly from claim documents. Essential for complex cases, workers' comp, and litigation support.",
                  detail: "Interactive visualization — click any event to see the source document.",
                  icon: ClockIcon,
                  iconBg: "bg-purple-100 text-purple-600",
                },
                {
                  title: "Duplicate & Billing Flags",
                  description: "Potential duplicate claims and CPT/ICD-10 code issues flagged before anyone reviews the file. Catches what simple text matching misses.",
                  detail: "Helps your team spot issues early — before they become expensive.",
                  icon: ShieldCheckIcon,
                  iconBg: "bg-amber-100 text-amber-600",
                },
                {
                  title: "Structured Export",
                  description: "Pull prepared data into your existing system however you want — CSV, Excel, webhook, API, or Zapier. ClarifyOps fits into your workflow, not the other way around.",
                  detail: "No migration required. Use it alongside what you have today.",
                  icon: CloudArrowUpIcon,
                  iconBg: "bg-emerald-100 text-emerald-600",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.iconBg}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.description}</p>
                  <p className="text-gray-400 text-xs leading-relaxed italic">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== INTERACTIVE SAMPLE PROCESSED CLAIM ===== */}
        <section id="sample-claim" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                See what a processed claim looks like
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                This is what your adjuster sees when they open a claim that ClarifyOps has already prepared. Click through each tab.
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Tab bar */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {["Summary", "Extracted Fields", "Medical Timeline", "Flags"].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setSampleStep(i)}
                    className={`flex-1 py-3.5 px-4 text-sm font-medium transition-colors ${
                      sampleStep === i 
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-8 min-h-[320px]">
                {sampleStep === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Claim #CLM-2024-0847</h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        94% Ready
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <strong>Prepared summary:</strong> Casualty claim filed by Maria Rodriguez following motor vehicle accident on 11/15/2024 in Cook County, IL. Claimant treated at Midwest Orthopedic Associates for lumbar sprain (ICD-10: M54.5) and abdominal contusion (S39.012A). Three office visits billed under CPT 99213 and 99214. Total billed amount: $12,450.00. Policy POL-2024-384291 is active. No duplicate claims detected. All CPT/ICD codes validated against CMS database.
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">This summary was built from a 42-page claim packet. Your adjuster reviews and adjusts — no typing required.</p>
                  </motion.div>
                )}

                {sampleStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: "Claimant", value: "Maria Rodriguez", confidence: 99 },
                        { label: "Policy Number", value: "POL-2024-384291", confidence: 98 },
                        { label: "Date of Loss", value: "11/15/2024", confidence: 97 },
                        { label: "Claim Type", value: "Casualty", confidence: 95 },
                        { label: "Billed Amount", value: "$12,450.00", confidence: 96 },
                        { label: "Provider", value: "Midwest Orthopedic Associates", confidence: 92 },
                        { label: "CPT Codes", value: "99213, 99214", confidence: 97 },
                        { label: "ICD-10", value: "M54.5, S39.012A", confidence: 98 },
                        { label: "Jurisdiction", value: "Cook County, IL", confidence: 88 },
                      ].map(field => (
                        <div key={field.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                          <p className="text-sm font-semibold text-gray-900">{field.value}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${field.confidence >= 95 ? 'bg-emerald-500' : field.confidence >= 90 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                style={{ width: `${field.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{field.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Each field includes a confidence score. Green = high confidence (auto-approve). Amber = worth a second look.</p>
                  </motion.div>
                )}

                {sampleStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
                    <p className="text-sm text-gray-500 mb-6">Medical chronology built from claim documents:</p>
                    {[
                      { date: "11/15/2024", event: "Motor vehicle accident — Cook County, IL", type: "Incident" },
                      { date: "11/16/2024", event: "ER visit — lumbar pain, abdominal tenderness. X-ray ordered.", type: "Emergency" },
                      { date: "11/22/2024", event: "Office visit — Midwest Ortho. Dx: lumbar sprain (M54.5). CPT 99213.", type: "Office Visit" },
                      { date: "12/06/2024", event: "Follow-up — improvement noted, PT recommended. CPT 99213.", type: "Office Visit" },
                      { date: "12/20/2024", event: "Final evaluation — cleared for normal activity. CPT 99214.", type: "Office Visit" },
                    ].map((entry, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                            entry.type === 'Incident' ? 'bg-red-500' : entry.type === 'Emergency' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          {i < 4 && <div className="w-0.5 h-12 bg-gray-200 mt-1" />}
                        </div>
                        <div className="pb-6">
                          <p className="text-xs font-semibold text-gray-400">{entry.date} <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            entry.type === 'Incident' ? 'bg-red-50 text-red-600' : entry.type === 'Emergency' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                          }`}>{entry.type}</span></p>
                          <p className="text-sm text-gray-700 mt-1">{entry.event}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {sampleStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="rounded-xl bg-emerald-50 p-5 border border-emerald-200">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-800">No duplicate claims found</p>
                          <p className="text-sm text-emerald-700 mt-1">Checked against 2,847 claims in your database — not just exact matches, but similar claims too.</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-5 border border-emerald-200">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-800">All CPT codes validated</p>
                          <p className="text-sm text-emerald-700 mt-1">99213 (Office visit, est. patient, low complexity) and 99214 (Office visit, est. patient, moderate complexity) confirmed against CMS database.</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-5 border border-emerald-200">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-800">ICD-10 codes valid and consistent</p>
                          <p className="text-sm text-emerald-700 mt-1">M54.5 (Low back pain) and S39.012A (Contusion of abdominal wall) match reported injuries and treatment.</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">All checks run when the claim file is uploaded. Your adjuster sees these results right away.</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== SECTION 4 — LOW RISK ADOPTION ===== */}
        <section className="py-20 px-6 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12),_transparent_65%)]" />
          <div className="relative max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                No integrations required
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Use ClarifyOps alongside what you already have. Export results however you want, whenever you're ready. Nothing to replace — just less prep work.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Upload anything", 
                  description: "PDFs, Word docs, images, scanned files. Drop them individually or batch upload 50 at a time.", 
                  icon: CloudArrowUpIcon 
                },
                { 
                  title: "Review prepared files", 
                  description: "Your team opens claim files that are already organized with extracted data, summaries, and flags.", 
                  icon: DocumentCheckIcon 
                },
                { 
                  title: "Export your way", 
                  description: "CSV, Excel, API, webhook, or Zapier. Pull data into whatever system you already use. No migration needed.", 
                  icon: ArrowRightIcon 
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="h-7 w-7 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <a 
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Try It on Your Own Claims — Free
                <ArrowRightIcon className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ===== SECTION 5 — WHO IT'S FOR ===== */}
        <section id="who-its-for" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Built for teams that handle document-heavy claims
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                If your people spend more time typing than adjusting, ClarifyOps was built for you.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Independent Adjusting Firms",
                  description: "Your adjusters handle high volumes across casualty, property, workers' comp, and more. ClarifyOps prepares each file so they can get to the actual adjusting faster.",
                  cta: "Perfect for firms with 5-100 adjusters"
                },
                {
                  title: "Legal Demand & Medical Record Review",
                  description: "Build medical chronologies and structured summaries from hundreds of pages of records. Save hours on demand package preparation and case review.",
                  cta: "Ideal for PI firms and review services"
                },
                {
                  title: "Claims Service Providers",
                  description: "Handle intake and triage for multiple clients. ClarifyOps creates a consistent, review-ready output regardless of how documents arrive.",
                  cta: "Scale intake without scaling headcount"
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>
                  <p className="text-blue-600 text-xs font-semibold">{item.cta}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 6 — EARLY PILOT SOCIAL PROOF ===== */}
        <section id="pilot" className="py-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 mb-6">
                <SparklesIcon className="h-4 w-4" />
                Early Design Pilots
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                We measure real handling-time reduction using your own files
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                We're working with a small number of adjusting firms to measure exactly how much time ClarifyOps saves per claim. No commitment — just upload some files and see the results.
              </p>
              <div className="grid sm:grid-cols-3 gap-6 mb-10 text-left">
                {[
                  { title: "Upload 20 claims", detail: "Use real files or anonymized ones. We process them and show you exactly what your team would receive." },
                  { title: "Compare handling time", detail: "We measure prep time before and after — you'll see the difference on your own documents." },
                  { title: "Keep everything", detail: "All extracted data, summaries, and chronologies are yours. Export them however you want." },
                ].map((step, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center mb-3">{i + 1}</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.detail}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:bini@clarifyops.com?subject=Pilot%20File&body=I%27d%20like%20to%20send%20an%20anonymized%20file%20for%20processing."
                  onClick={() => logEvent('cta_send_file', { source: 'pilot_section' })}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
                >
                  Send Us a File — We'll Process It
                  <ArrowRightIcon className="h-5 w-5" />
                </a>
                <a 
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Or Sign Up Free
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Try Document Demo Section — KEPT */}
        <TryDocumentDemo />

        {/* ROI Calculator Section — KEPT */}
        <ROICalculator />

        {/* Compliance Badges Section — KEPT */}
        <ComplianceBadges />

        {/* Testimonials Section — KEPT */}
        <TestimonialsSection />

        {/* Pricing Section — KEPT */}
        <PricingSection />

        {/* ===== FINAL CTA — Low-commitment close ===== */}
        <section className="py-24 px-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.05),_transparent_50%)]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Tomorrow morning, your adjusters could open
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">claim files that are already prepared.</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-white/60 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Send us one anonymized file. We'll process it and send back the results. No account needed, no commitment.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <a 
                href="mailto:bini@clarifyops.com?subject=Pilot%20File&body=I%27d%20like%20to%20send%20an%20anonymized%20file%20for%20processing."
                onClick={() => logEvent('cta_send_file', { source: 'final_cta' })}
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-xl transition-all duration-300"
              >
                Send Us a File — We'll Process It
              </a>
              <a 
                href="/signup"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                Or Try It Yourself — Free
                <ArrowRightIcon className="h-5 w-5" />
              </a>
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
                Your adjuster opens a prepared file — not a pile of documents.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#what-you-get" className="hover:text-white transition-colors">What You Get</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/compare" className="hover:text-white transition-colors">Compare</Link></li>
                <li><Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Use Cases</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/use-cases/workers-comp" className="hover:text-white transition-colors">Workers' Comp</Link></li>
                <li><Link to="/use-cases/auto-fnol" className="hover:text-white transition-colors">Auto FNOL</Link></li>
                <li><Link to="/use-cases/medical-billing" className="hover:text-white transition-colors">Medical Billing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#pilot" className="hover:text-white transition-colors">Run a Pilot</a></li>
                <li><a href="#roi-calculator" className="hover:text-white transition-colors">ROI Calculator</a></li>
                <li><Link to="/trust" className="hover:text-white transition-colors">Trust Center</Link></li>
                <li><a href={supportHref} className="hover:text-white transition-colors">Contact</a></li>
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
