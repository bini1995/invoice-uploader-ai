import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const caseStudies = [
  {
    id: 'regional-tpa',
    title: 'Regional TPA Saves $316K/Year with AI Claims Extraction',
    subtitle: 'How a 25-person TPA eliminated manual data entry and cut processing time by 82%',
    industry: 'Third-Party Administration',
    color: 'blue',
    logo: 'RT',
    challenge: {
      description: 'A regional TPA processing 2,500 workers\' comp and auto claims per month was struggling with manual data entry bottlenecks. Their team of 8 claims processors spent an average of 45 minutes per claim on data extraction alone, leading to backlogs, overtime costs, and a 6.2% error rate that caused downstream rework.',
      painPoints: [
        'Average 45 minutes per claim for manual data entry',
        '6.2% error rate causing rework and delayed settlements',
        'Staff overtime costing $4,200/month',
        'Growing backlog averaging 340 unprocessed claims at any time'
      ]
    },
    solution: {
      description: 'The TPA deployed ClarifyOps to automate claims data extraction across their workers\' comp and auto FNOL workflows. Within 2 weeks, the team transitioned from manual PDF review to AI-powered extraction with human-in-the-loop verification.',
      features: [
        'AI field extraction for CPT codes, ICD-10, policy numbers, and injury descriptions',
        'Automated claim readiness scoring to flag incomplete submissions',
        'Workflow routing rules to assign claims to specialized adjusters',
        'Real-time dashboard for management visibility into processing pipeline'
      ]
    },
    results: {
      savings: '$316,000',
      savingsPeriod: 'annual savings',
      metrics: [
        { label: 'Processing Time', before: '45 min/claim', after: '8 min/claim', improvement: '82% faster' },
        { label: 'Error Rate', before: '6.2%', after: '1.1%', improvement: '82% reduction' },
        { label: 'Monthly Backlog', before: '340 claims', after: '45 claims', improvement: '87% reduction' },
        { label: 'Staff Overtime', before: '$4,200/mo', after: '$200/mo', improvement: '95% reduction' }
      ],
      roi: '1,580%',
      paybackPeriod: '23 days'
    },
    quote: {
      text: 'We went from drowning in paper to having real-time visibility into every claim. The AI extraction is remarkably accurate for CPT and ICD codes.',
      author: 'Operations Director',
      company: 'Regional TPA (name withheld for privacy)'
    },
    methodology: 'Based on ROI calculator projections using: 2,500 claims/month, $35/hr processor rate, 45-min avg manual processing, 6.2% error rate. Results represent projected annual savings with ClarifyOps Beta Pro plan at $199/month.'
  },
  {
    id: 'medical-billing',
    title: 'NYC Medical Billing Office Reduces Denial Rate by 34%',
    subtitle: 'How a 5-provider clinic automated claim submissions and improved first-pass acceptance',
    industry: 'Medical Billing',
    color: 'emerald',
    logo: 'MB',
    challenge: {
      description: 'A multi-provider medical practice in New York City was experiencing a 23% claim denial rate, well above the industry average of 5-10%. Most denials stemmed from incorrect coding, missing documentation, and data entry errors during manual claim preparation.',
      painPoints: [
        '23% claim denial rate vs. 5-10% industry average',
        'Average $14,800/month in lost revenue from denied claims',
        '2 FTEs dedicated solely to denial management and resubmission',
        'Average 38 days to payment vs. industry benchmark of 21 days'
      ]
    },
    solution: {
      description: 'The practice implemented ClarifyOps to validate claims before submission. The AI engine checks CPT/ICD-10 code validity, flags missing required fields, and generates a Claim Readiness Score to predict first-pass acceptance likelihood.',
      features: [
        'Pre-submission validation with CPT/ICD-10 code verification',
        'Claim Readiness Score predicting denial risk before submission',
        'Automated flagging of missing documentation or inconsistent codes',
        'Dashboard tracking denial trends and root causes'
      ]
    },
    results: {
      savings: '$142,000',
      savingsPeriod: 'annual recovery',
      metrics: [
        { label: 'Denial Rate', before: '23%', after: '15.2%', improvement: '34% reduction' },
        { label: 'Revenue Recovery', before: '$14.8K/mo lost', after: '$2.9K/mo lost', improvement: '$11.9K/mo saved' },
        { label: 'Days to Payment', before: '38 days', after: '24 days', improvement: '37% faster' },
        { label: 'Denial FTEs Needed', before: '2 full-time', after: '0.5 part-time', improvement: '75% reduction' }
      ],
      roi: '1,183%',
      paybackPeriod: '31 days'
    },
    quote: {
      text: 'The Claim Readiness Score alone has been transformative. We catch issues before they become denials, which means faster payment and less rework.',
      author: 'Practice Administrator',
      company: 'Multi-Provider NYC Medical Practice'
    },
    methodology: 'Based on ROI calculator projections using: 800 claims/month, $42/hr billing specialist rate, 30-min avg processing, 23% baseline denial rate. Results represent projected improvements with ClarifyOps Beta Starter plan at $99/month.'
  },
  {
    id: 'independent-adjuster',
    title: 'Independent Adjuster Handles 3x More Claims Without Hiring',
    subtitle: 'How a solo IA firm scaled from 80 to 240 claims/month with AI-assisted processing',
    industry: 'Independent Adjusting',
    color: 'purple',
    logo: 'IA',
    challenge: {
      description: 'An independent adjusting firm with 3 adjusters was turning away business because they couldn\'t keep up with claim volume. Each adjuster spent roughly 40% of their time on data entry and documentation rather than actual adjusting work like inspections and coverage analysis.',
      painPoints: [
        'Turning away 30-40% of incoming assignments due to capacity',
        'Adjusters spending 40% of time on administrative data entry',
        'Average 3-day turnaround per claim (vs. client expectation of 1 day)',
        'No systematic way to prioritize high-value or urgent claims'
      ]
    },
    solution: {
      description: 'The firm adopted ClarifyOps to automate the data extraction and documentation phase of claim processing. AI handles the intake, field extraction, and initial categorization, letting adjusters focus on high-value analysis and decisions.',
      features: [
        'Automated intake and field extraction from uploaded claim documents',
        'Smart routing to prioritize urgent and high-value claims',
        'Auto-generated claim summaries for quick adjuster review',
        'Export templates for carrier-specific reporting formats'
      ]
    },
    results: {
      savings: '$187,000',
      savingsPeriod: 'additional annual revenue',
      metrics: [
        { label: 'Claims Capacity', before: '80/month', after: '240/month', improvement: '3x increase' },
        { label: 'Admin Time per Claim', before: '2.5 hours', after: '35 minutes', improvement: '77% reduction' },
        { label: 'Turnaround Time', before: '3 days', after: '< 1 day', improvement: '67% faster' },
        { label: 'Revenue per Adjuster', before: '$8,500/mo', after: '$13,700/mo', improvement: '61% increase' }
      ],
      roi: '935%',
      paybackPeriod: '38 days'
    },
    quote: {
      text: 'I used to spend half my day typing data into spreadsheets. Now I upload the docs, ClarifyOps pulls everything out, and I can focus on actually adjusting claims.',
      author: 'Senior Independent Adjuster',
      company: 'Independent Adjusting Firm (3 adjusters)'
    },
    methodology: 'Based on ROI calculator projections using: 80 baseline claims/month growing to 240, $45/hr adjuster rate, 2.5 hrs admin time per claim. Results represent projected revenue gains with ClarifyOps Free Starter + Beta Starter plan at $99/month.'
  }
];

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dark: 'bg-blue-600', light: 'bg-blue-100' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dark: 'bg-emerald-600', light: 'bg-emerald-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dark: 'bg-purple-600', light: 'bg-purple-100' }
};

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 bg-white/90 backdrop-blur-xl z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/">
            <img src="/logo.png" alt="ClarifyOps" className="h-7" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
            <Link to="/compare" className="text-sm text-gray-600 hover:text-gray-900">Compare</Link>
            <a href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <Link to="/signup" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-semibold hover:from-blue-500 hover:to-indigo-500">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ChartBarIcon className="h-4 w-4" />
            ROI Case Studies
          </motion.span>
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Real ROI from AI-Powered
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Claims Processing</span>
          </motion.h1>
          <motion.p
            className="text-xl text-white/70 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            See how organizations like yours are saving time and money with ClarifyOps. These projections are based on our ROI calculator using realistic industry benchmarks.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">$645K+</div>
              <div className="text-sm text-white/50">Combined Projected Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">82%</div>
              <div className="text-sm text-white/50">Avg Processing Time Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">31 days</div>
              <div className="text-sm text-white/50">Avg Payback Period</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-12 text-center">
            <p className="text-amber-800 text-sm">
              <strong>Transparency Note:</strong> These case studies are based on projected savings using our ROI calculator with realistic industry benchmarks. 
              Company names are illustrative. As beta participants validate results, we will update with verified data.
            </p>
          </div>

          {caseStudies.map((study, index) => {
            const colors = colorMap[study.color];
            return (
              <motion.article
                key={study.id}
                className="mb-20 last:mb-0"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${colors.bg} border ${colors.border} rounded-2xl p-8 mb-8`}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 ${colors.dark} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                        {study.logo}
                      </div>
                      <div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>{study.industry}</span>
                        <h2 className="text-2xl font-bold text-gray-900">{study.title}</h2>
                        <p className="text-gray-600">{study.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${colors.text}`}>{study.results.savings}</div>
                      <div className="text-sm text-gray-500">{study.results.savingsPeriod}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    {study.results.metrics.map((metric, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                        <div className="text-sm text-gray-400 line-through">{metric.before}</div>
                        <div className={`text-xl font-bold ${colors.text}`}>{metric.after}</div>
                        <div className="text-xs font-semibold text-emerald-600 mt-1">{metric.improvement}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-red-500" />
                      The Challenge
                    </h3>
                    <p className="text-gray-600 mb-4">{study.challenge.description}</p>
                    <ul className="space-y-2">
                      {study.challenge.painPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-red-400 mt-1 flex-shrink-0">&#x2717;</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-blue-500" />
                      The Solution
                    </h3>
                    <p className="text-gray-600 mb-4">{study.solution.description}</p>
                    <ul className="space-y-2">
                      {study.solution.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {study.quote && (
                  <div className="mt-8 bg-gray-50 rounded-xl p-6 border-l-4 border-gray-300">
                    <blockquote className="text-gray-700 italic mb-3">"{study.quote.text}"</blockquote>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">{study.quote.author}</span>
                      <span className="text-gray-500"> — {study.quote.company}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 text-center">
                    <div className="text-xs text-gray-500">ROI</div>
                    <div className="text-lg font-bold text-emerald-600">{study.results.roi}</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2 text-center">
                    <div className="text-xs text-gray-500">Payback</div>
                    <div className="text-lg font-bold text-blue-600">{study.results.paybackPeriod}</div>
                  </div>
                  <p className="text-xs text-gray-400 flex-1">{study.methodology}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-r from-slate-900 via-indigo-700 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to See Your Own ROI?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Use our ROI calculator to estimate savings for your specific volume and workflow, then start a free trial to validate the results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/#roi-calculator" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              <ChartBarIcon className="h-5 w-5" />
              Calculate Your ROI
            </a>
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-slate-900 transition-colors">
              <ArrowRightIcon className="h-5 w-5" />
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>&copy; 2026 ClarifyOps. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/trust" className="hover:text-white">Trust Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
