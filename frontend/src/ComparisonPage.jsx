import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const competitors = [
  { name: 'ClarifyOps', highlight: true },
  { name: 'Rossum', highlight: false },
  { name: 'Luminai', highlight: false },
  { name: 'Affinda', highlight: false },
  { name: 'Wisedocs', highlight: false }
];

const comparisonData = [
  {
    category: 'AI Capabilities',
    features: [
      { name: 'AI-Powered Field Extraction', values: [true, true, 'partial', true, true] },
      { name: 'CPT/ICD-10 Code Recognition', values: [true, false, false, 'partial', true] },
      { name: 'Claim Readiness Score', values: [true, false, false, false, false] },
      { name: 'Multi-Document Correlation', values: [true, 'partial', true, false, false] },
      { name: 'Custom AI Model Training', values: [true, true, false, true, false] }
    ]
  },
  {
    category: 'Insurance-Specific Features',
    features: [
      { name: 'Policy Number Extraction', values: [true, 'partial', false, 'partial', true] },
      { name: 'FNOL Processing', values: [true, false, false, false, 'partial'] },
      { name: 'Medical Bill Parsing', values: [true, false, false, 'partial', true] },
      { name: 'Fraud Detection', values: [true, false, 'partial', false, false] },
      { name: 'Workflow Routing', values: [true, 'partial', true, false, false] }
    ]
  },
  {
    category: 'Compliance & Security',
    features: [
      { name: 'HIPAA Compliant', values: [true, true, true, true, true] },
      { name: 'SOC 2 Type II', values: [true, true, 'partial', true, false] },
      { name: 'PHI Auto-Redaction', values: [true, false, false, 'partial', true] },
      { name: 'Complete Audit Trail', values: [true, 'partial', true, 'partial', 'partial'] },
      { name: 'GDPR Compliant', values: [true, true, true, true, 'partial'] }
    ]
  },
  {
    category: 'Integration & Deployment',
    features: [
      { name: 'Guidewire Integration', values: [true, 'partial', false, false, false] },
      { name: 'Duck Creek Integration', values: [true, false, false, false, false] },
      { name: 'REST API', values: [true, true, true, true, true] },
      { name: 'Zapier / Webhook Support', values: [true, true, true, 'partial', false] },
      { name: 'On-Premise Option', values: [true, true, false, true, false] }
    ]
  },
  {
    category: 'Pricing & Support',
    features: [
      { name: 'Transparent Pricing', values: [true, false, false, false, 'partial'] },
      { name: 'Free Trial Available', values: [true, false, 'partial', true, false] },
      { name: 'Per-Page Pricing', values: [true, true, false, true, true] },
      { name: 'Dedicated Support', values: [true, 'partial', true, 'partial', false] },
      { name: 'Implementation Assistance', values: [true, true, true, 'partial', false] }
    ]
  }
];

const ValueIcon = ({ value }) => {
  if (value === true) {
    return <CheckCircleIcon className="h-6 w-6 text-emerald-500" />;
  } else if (value === false) {
    return <XCircleIcon className="h-6 w-6 text-red-400" />;
  } else {
    return <MinusCircleIcon className="h-6 w-6 text-yellow-500" />;
  }
};

const keyDifferentiators = [
  {
    icon: SparklesIcon,
    title: 'Claim Readiness Score',
    description: 'Only ClarifyOps provides a proprietary readiness score that predicts claim completion and identifies missing fields before submission.',
    color: 'blue'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Insurance-Native AI',
    description: 'Built specifically for insurance workflows, not adapted from general document processing. Understands CPT, ICD-10, policy structures natively.',
    color: 'emerald'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Transparent Pricing',
    description: 'No hidden fees or surprise costs. Clear per-page pricing with predictable monthly costs, unlike competitors who hide pricing.',
    color: 'purple'
  },
  {
    icon: BoltIcon,
    title: 'Speed to Value',
    description: 'Go live in days, not months. Pre-built insurance integrations and templates mean faster deployment than horizontal solutions.',
    color: 'orange'
  }
];

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <a href="/">
            <img src="/logo.png" alt="ClarifyOps" className="h-7" />
          </a>
          <a
            href="https://calendly.com/clarifyops-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
        </nav>
      </header>

      <main>
        <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="max-w-5xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-6"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Competitive Analysis
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Why Choose ClarifyOps Over
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> The Competition?</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/70 max-w-3xl mx-auto"
            >
              See how ClarifyOps stacks up against horizontal document processing tools and other claims solutions
            </motion.p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Differentiators</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {keyDifferentiators.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${item.color}-100`}>
                    <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Feature-by-Feature Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 w-1/3">Feature</th>
                    {competitors.map((comp) => (
                      <th
                        key={comp.name}
                        className={`text-center px-4 py-4 font-semibold ${
                          comp.highlight ? 'bg-blue-600 text-white' : 'text-gray-700'
                        }`}
                      >
                        {comp.name}
                        {comp.highlight && (
                          <span className="block text-xs font-normal opacity-80">You are here</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((category) => (
                    <React.Fragment key={category.category}>
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-3 font-semibold text-gray-800 text-sm uppercase tracking-wider">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature, idx) => (
                        <tr key={feature.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-6 py-4 text-gray-700">{feature.name}</td>
                          {feature.values.map((value, i) => (
                            <td
                              key={i}
                              className={`text-center px-4 py-4 ${
                                i === 0 ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex justify-center">
                                <ValueIcon value={value} />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                <span>Full Support</span>
              </div>
              <div className="flex items-center gap-2">
                <MinusCircleIcon className="h-5 w-5 text-yellow-500" />
                <span>Partial Support</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <span>Not Available</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to See the Difference?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join forward-thinking insurance ops teams who've already switched to ClarifyOps
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://calendly.com/clarifyops-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-white/90 transition-colors"
              >
                Schedule a Demo
                <ArrowRightIcon className="h-5 w-5" />
              </a>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                Try Free Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            2024 ClarifyOps. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
