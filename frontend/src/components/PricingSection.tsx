import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, StarIcon, SparklesIcon, GiftIcon, RocketLaunchIcon, FireIcon } from '@heroicons/react/24/outline';

export default function PricingSection() {
  const betaPlans = [
    {
      name: "Free Starter",
      betaPrice: "$0",
      regularPrice: null,
      period: "/month",
      description: "Try ClarifyOps risk-free — no credit card required",
      features: [
        "Up to 50 claim documents/month",
        "AI field extraction (CPT, ICD-10, policy)",
        "Basic review queue",
        "CSV export",
        "Community support",
        "HIPAA-ready infrastructure"
      ],
      cta: "Start Free",
      highlight: false,
      badge: null,
      color: "gray"
    },
    {
      name: "Beta Starter",
      betaPrice: "$99",
      regularPrice: "$499",
      period: "/month",
      description: "For small TPAs and independent adjusters starting with AI",
      features: [
        "Up to 500 claim documents/month",
        "AI field extraction (CPT, ICD-10, policy)",
        "Review queue + corrections",
        "CSV/Excel export",
        "Email support",
        "HIPAA-ready infrastructure",
        "Claim Readiness Score"
      ],
      cta: "Start Beta Pilot",
      highlight: false,
      badge: "Save 80%",
      color: "blue"
    },
    {
      name: "Beta Pro",
      betaPrice: "$199",
      regularPrice: "$2,000",
      period: "/month",
      description: "For operations teams ready to scale claim processing",
      features: [
        "Up to 2,500 documents/month",
        "Everything in Beta Starter",
        "Denial Risk Detection",
        "Automated routing rules",
        "Webhook integrations",
        "Priority support",
        "API access",
        "AuditFlow fraud scoring"
      ],
      cta: "Start Beta Pilot",
      highlight: true,
      badge: "Most Popular",
      color: "purple"
    },
    {
      name: "Beta Enterprise",
      betaPrice: "$299",
      regularPrice: "Custom",
      period: "/month",
      description: "For carriers and large TPAs needing full capabilities",
      features: [
        "Up to 10,000 documents/month",
        "Everything in Beta Pro",
        "Custom workflow rules",
        "Dedicated onboarding",
        "Phone + Slack support",
        "Custom AI model tuning",
        "SLA guarantees",
        "Multi-tenant setup"
      ],
      cta: "Contact Us",
      highlight: false,
      badge: "Save 85%+",
      color: "indigo"
    }
  ];

  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white mb-6 shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FireIcon className="h-4 w-4" />
            Beta Pilot Program — Limited to First 50 Companies
            <FireIcon className="h-4 w-4" />
          </motion.span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lock In Beta Pricing for 3 Months
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our Beta Pilot and get deeply discounted access. Help shape the product, and keep your beta rate when we launch publicly.
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <GiftIcon className="h-5 w-5 text-amber-600" />
              <span className="text-gray-700"><strong>Free tier</strong> — 50 claims/month, no credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <RocketLaunchIcon className="h-5 w-5 text-amber-600" />
              <span className="text-gray-700"><strong>1-month free trial</strong> on any paid plan</span>
            </div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-amber-600" />
              <span className="text-gray-700"><strong>Beta rate locked</strong> for 3 months minimum</span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {betaPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                plan.highlight 
                  ? 'border-purple-500 bg-white shadow-2xl lg:scale-105 z-10' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: plan.highlight ? 1.05 : 1.02 }}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold text-white ${
                    plan.highlight 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500'
                  } flex items-center gap-1.5 whitespace-nowrap`}>
                    {plan.highlight && <StarIcon className="h-4 w-4" />}
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6 mt-2">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.betaPrice}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                {plan.regularPrice && (
                  <p className="text-sm text-gray-400">
                    <span className="line-through">{plan.regularPrice}/mo</span>
                    <span className="text-green-600 font-semibold ml-2">Beta Price</span>
                  </p>
                )}
                <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2.5">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => {
                  if (plan.name === 'Beta Enterprise') {
                    window.location.href = 'mailto:sales@clarifyops.com?subject=Beta Enterprise Pilot';
                  } else {
                    window.location.href = '/signup';
                  }
                }}
                className={`w-full py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                  plan.highlight 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg' 
                    : plan.name === 'Free Starter'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p 
          className="text-center text-gray-500 text-sm mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          All plans include HIPAA-ready infrastructure and BAA available on request. Beta pricing locked for first 3 months.
        </motion.p>

        <motion.div 
          className="text-center mt-12 p-8 bg-white rounded-xl border border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Why ClarifyOps Beats Rossum, Affinda & Wisedocs
          </h3>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="flex items-start gap-3">
              <SparklesIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Claims-Native AI</h4>
                <p className="text-gray-600 text-sm">Purpose-built for CPT, ICD-10, policy numbers — not generic document extraction</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <SparklesIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Claim Readiness Score</h4>
                <p className="text-gray-600 text-sm">Know instantly if a claim is complete, what's missing, and denial risk</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <SparklesIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Adjuster Workflow Built-In</h4>
                <p className="text-gray-600 text-sm">Route, review, approve — no separate workflow tool needed</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
