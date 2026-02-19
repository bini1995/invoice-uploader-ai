import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, ClockIcon, CurrencyDollarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple pricing. Pay per claim.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No subscription. No seat licenses. No annual contracts.
            You pay only when we prepare a claim for your team.
          </p>
        </motion.div>

        <motion.div
          className="relative bg-white rounded-3xl border-2 border-blue-200 shadow-2xl p-8 md:p-12 mb-12 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold mb-6">
                First 25 Claims Free
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-6xl md:text-7xl font-bold text-gray-900">$4</span>
                <span className="text-2xl text-gray-500 font-medium">per claim</span>
              </div>
              <p className="text-gray-600 text-lg mb-6">
                That's it. No hidden fees, no tiers, no upsells.
              </p>
              <a 
                href="mailto:claims@clarifyops.com?subject=Sample%20Claim&body=Hi%20—%20I%27d%20like%20to%20try%20ClarifyOps%20with%20a%20sample%20claim%20file."
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300"
              >
                Send Us a Sample Claim
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckIcon className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">First 25 claims completely free</p>
                  <p className="text-sm text-gray-500">Measure the time saved before you decide anything</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Full claim summary, codes & timeline</p>
                  <p className="text-sm text-gray-500">CPT/ICD validated, duplicates flagged, ready for review</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">No commitment, cancel anytime</p>
                  <p className="text-sm text-gray-500">Process 1 claim or 1,000 — your choice</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Volume discounts available</p>
                  <p className="text-sm text-gray-500">Processing 500+ claims/month? Let's talk</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Why $4 is a no-brainer
          </h3>
          <p className="text-gray-500 text-center mb-8 text-sm">Your adjusters' time is worth far more than $4.</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="rounded-xl border-2 border-red-100 bg-red-50/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="h-5 w-5 text-red-600" />
                <h4 className="text-lg font-bold text-red-900">Manual claim prep</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between"><span>Time per claim</span><span className="font-semibold">15-45 min</span></div>
                <div className="flex justify-between"><span>Adjuster hourly cost</span><span className="font-semibold">$35-$70/hr</span></div>
                <div className="flex justify-between border-t border-red-200 pt-3"><span className="font-bold">Labor cost per claim</span><span className="font-bold text-red-600">$20-$60</span></div>
              </div>
            </div>
            <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" />
                <h4 className="text-lg font-bold text-emerald-900">With ClarifyOps</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between"><span>Processing time</span><span className="font-semibold">~2 min</span></div>
                <div className="flex justify-between"><span>No adjuster time needed</span><span className="font-semibold">Automated</span></div>
                <div className="flex justify-between border-t border-emerald-200 pt-3"><span className="font-bold">Cost per claim</span><span className="font-bold text-emerald-600">$4</span></div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl px-6 py-4">
              <span className="text-3xl font-bold text-emerald-700">80-93%</span>
              <span className="text-gray-600 text-sm text-left">savings on every<br/>claim you process</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-500 text-sm">
            HIPAA-ready infrastructure. Your data is isolated and encrypted. BAA available on request.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
