import React, { useState } from 'react';
import ProgressBar from './components/ProgressBar';
import { API_BASE } from './api';
import PageHeader from './components/PageHeader';

const SAMPLE_CLAIM = {
  claimNumber: 'CLM-2024-0847',
  dateOfLoss: '11/15/2024',
  claimantName: 'Maria Rodriguez',
  policyNumber: 'POL-2024-384291',
  claimType: 'Casualty',
  billedAmount: '$12,450.00',
  cptCodes: ['99213', '99214'],
  cptValid: true,
  icdCodes: ['M54.5', 'S39.012A'],
  provider: 'Midwest Ortho — Dr. Sarah Chen',
  visits: 3,
  readiness: 94,
  flags: [],
  summary: 'Casualty claim for lumbar sprain following MVA on 11/15/2024. Claimant treated at Midwest Ortho, 3 visits. Total billed $12,450. CPT 99213, 99214 validated. No duplicate flags. Claim readiness: high.',
};

export default function DemoSandbox() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleProcess = () => {
    setStep(2);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2200);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <PageHeader title="ClarifyOps" subtitle="See What an Adjuster-Ready Packet Looks Like" />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Incoming Document</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-xl">
                  PDF
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Rodriguez_Casualty_Claim_Packet.pdf</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">60 pages — medical records, bills, police report</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Normally, your adjuster would open this and spend 30-45 minutes pulling out the key details before starting their review.
              </p>
            </div>
            <div className="text-center">
              <button
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all"
                onClick={handleProcess}
              >
                Process with ClarifyOps
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 shadow-sm text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Reading document, extracting fields, validating codes...</p>
            <ProgressBar value={loading ? 65 : 100} />
            <p className="text-xs text-gray-400">This usually takes under 60 seconds</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Adjuster-Ready Claim Packet</p>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ready to send</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Review-Ready
                </span>
              </div>

              <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">First-Pass Summary</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{SAMPLE_CLAIM.summary}</p>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-slate-700 border-b border-gray-100 dark:border-slate-700">
                <div className="p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Policy</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{SAMPLE_CLAIM.policyNumber}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Billed Amount</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{SAMPLE_CLAIM.billedAmount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-slate-700 border-b border-gray-100 dark:border-slate-700">
                <div className="p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">CPT Codes</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {SAMPLE_CLAIM.cptCodes.join(', ')}{' '}
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">valid</span>
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">ICD-10</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{SAMPLE_CLAIM.icdCodes.join(', ')}</p>
                </div>
              </div>

              <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Claim Readiness</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{SAMPLE_CLAIM.readiness}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${SAMPLE_CLAIM.readiness}%` }}></div>
                </div>
              </div>

              <div className="p-5 flex flex-wrap gap-2">
                {['No Duplicates', 'Codes Valid', 'Ready to Route'].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>What just happened:</strong> ClarifyOps read a 60-page document, pulled out the key fields, validated CPT/ICD codes, checked for duplicates, and prepared this summary — work that normally takes 30-45 minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                Try It With Your Own File
              </a>
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              >
                Watch Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
