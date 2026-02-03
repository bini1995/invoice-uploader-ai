import React from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TruckIcon,
  HeartIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const useCases = {
  'workers-comp': {
    title: 'Workers Compensation Claims',
    subtitle: 'Streamline workplace injury claims processing',
    icon: BuildingOfficeIcon,
    color: 'blue',
    hero: {
      stat1: { value: '70%', label: 'Faster Processing' },
      stat2: { value: '$2.3M', label: 'Annual Savings' },
      stat3: { value: '95%', label: 'Accuracy Rate' }
    },
    description: 'Workers compensation claims require meticulous documentation of workplace injuries, medical treatments, and lost wages. ClarifyOps automates the extraction of injury details, ICD-10 codes, treatment plans, and wage calculations from complex medical and employment records.',
    challenges: [
      'Complex medical documentation with multiple treatment providers',
      'Calculating average weekly wages from various pay structures',
      'Tracking maximum medical improvement (MMI) dates',
      'Managing return-to-work restrictions and accommodations',
      'Coordinating between employers, insurers, and medical providers'
    ],
    solutions: [
      'Automatic extraction of injury codes, body parts affected, and treatment details',
      'AI-powered wage calculation from pay stubs and employment records',
      'Smart tracking of MMI status and disability ratings',
      'Work restriction detection and accommodation recommendations',
      'Unified dashboard for multi-party claim coordination'
    ],
    extractedFields: [
      'Injury Date & Time', 'Body Parts Affected', 'ICD-10 Codes', 'CPT Codes',
      'Employer Information', 'Average Weekly Wage', 'Disability Rating',
      'Treatment Provider NPI', 'Return to Work Date', 'Restrictions'
    ]
  },
  'auto-fnol': {
    title: 'Auto Insurance FNOL',
    subtitle: 'First Notice of Loss automation',
    icon: TruckIcon,
    color: 'emerald',
    hero: {
      stat1: { value: '5 min', label: 'Avg FNOL Time' },
      stat2: { value: '85%', label: 'Auto-Routed' },
      stat3: { value: '24/7', label: 'Processing' }
    },
    description: 'First Notice of Loss is the critical first step in auto claims. ClarifyOps instantly captures accident details, vehicle information, policy coverage, and driver data from police reports, photos, and customer submissions to route claims accurately from the start.',
    challenges: [
      'Inconsistent information from multiple parties',
      'Manual data entry from police reports and photos',
      'Determining coverage and liability quickly',
      'Managing high volume during peak accident periods',
      'Coordinating between adjusters, body shops, and rental agencies'
    ],
    solutions: [
      'OCR extraction from police reports, photos, and handwritten forms',
      'Automatic VIN decoding and vehicle identification',
      'Real-time policy lookup and coverage verification',
      'Smart routing based on damage severity and coverage type',
      'Integration with repair networks and rental partners'
    ],
    extractedFields: [
      'Policy Number', 'VIN', 'Make/Model/Year', 'Driver Information',
      'Accident Date/Time/Location', 'Police Report Number', 'Other Party Info',
      'Damage Description', 'Injury Indicators', 'Coverage Type'
    ]
  },
  'medical-billing': {
    title: 'Medical Billing Review',
    subtitle: 'Healthcare claims cost containment',
    icon: HeartIcon,
    color: 'purple',
    hero: {
      stat1: { value: '40%', label: 'Cost Savings' },
      stat2: { value: '99.9%', label: 'Code Accuracy' },
      stat3: { value: '18 min', label: 'Review Time' }
    },
    description: 'Medical billing review requires deep expertise in CPT codes, ICD-10 diagnoses, and fee schedules. ClarifyOps uses specialized AI trained on millions of medical claims to identify coding errors, duplicate charges, and billing anomalies automatically.',
    challenges: [
      'Complex CPT and ICD-10 code validation',
      'Identifying upcoding and unbundling errors',
      'Comparing charges against fee schedules',
      'Processing high volumes of itemized bills',
      'Maintaining compliance with billing regulations'
    ],
    solutions: [
      'AI-powered CPT/ICD-10 code extraction and validation',
      'Automatic detection of coding errors and anomalies',
      'Real-time fee schedule comparison and repricing',
      'Duplicate charge and unbundling detection',
      'Compliance checks against CMS guidelines'
    ],
    extractedFields: [
      'CPT Codes', 'ICD-10 Diagnoses', 'Provider NPI', 'Facility Type',
      'Date of Service', 'Billed Amount', 'Units', 'Modifiers',
      'Place of Service', 'Referring Provider', 'Patient Demographics'
    ]
  }
};

const heroGradients = {
  blue: 'from-blue-900 to-blue-800',
  emerald: 'from-emerald-900 to-emerald-800',
  purple: 'from-purple-900 to-purple-800'
};

function UseCaseDetail({ useCase }) {
  const Icon = useCase.icon;
  const gradient = heroGradients[useCase.color] || 'from-slate-900 to-slate-800';
  
  return (
    <>
      <section className={`py-20 px-6 bg-gradient-to-br ${gradient} text-white`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className={`p-3 rounded-xl bg-white/10`}>
              <Icon className="h-8 w-8" />
            </div>
            <span className={`px-4 py-1 rounded-full text-xs font-semibold bg-white/20 border border-white/30`}>
              Use Case
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {useCase.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 mb-12"
          >
            {useCase.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {Object.values(useCase.hero).map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6 text-center border border-white/20">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            {useCase.description}
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-red-600" />
                </div>
                The Challenges
              </h2>
              <ul className="space-y-4">
                {useCase.challenges.map((challenge, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-600">{challenge}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <SparklesIcon className="h-5 w-5 text-emerald-600" />
                </div>
                ClarifyOps Solutions
              </h2>
              <ul className="space-y-4">
                {useCase.solutions.map((solution, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{solution}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Automatically Extracted Fields
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {useCase.extractedFields.map((field, i) => (
              <motion.span
                key={field}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`px-4 py-2 rounded-full bg-white border border-${useCase.color}-200 text-${useCase.color}-700 font-medium shadow-sm`}
              >
                {field}
              </motion.span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function UseCasesList() {
  return (
    <>
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-6"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Industry Use Cases
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Built for Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Claims Workflow</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-3xl mx-auto"
          >
            See how ClarifyOps handles specific claim types with purpose-built extraction and validation
          </motion.p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(useCases).map(([key, useCase], index) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/use-cases/${key}`}
                    className="block bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-${useCase.color}-100`}>
                      <Icon className={`h-7 w-7 text-${useCase.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{useCase.subtitle}</p>
                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                      Learn More
                      <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default function UseCasesPage() {
  const { caseId } = useParams();
  const useCase = caseId ? useCases[caseId] : null;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Link
            to={useCase ? "/use-cases" : "/"}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>{useCase ? "All Use Cases" : "Back to Home"}</span>
          </Link>
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ClarifyOps" className="h-8 w-auto" />
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
        {useCase ? <UseCaseDetail useCase={useCase} /> : <UseCasesList />}

        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Claims Processing?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              See how ClarifyOps can work for your specific use case
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
