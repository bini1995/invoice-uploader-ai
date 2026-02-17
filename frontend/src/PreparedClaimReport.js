import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import ConfidenceIndicator from './components/ConfidenceIndicator';
import DuplicateWarning from './components/DuplicateWarning';
import ClaimChronology from './components/ClaimChronology';
import { API_BASE } from './api';

function ReadinessBadge({ score }) {
  const pct = score != null ? (score <= 1 ? Math.round(score * 100) : Math.round(score)) : null;
  if (pct == null) return null;
  const color = pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'red';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400`}>
      <span className={`w-1.5 h-1.5 bg-${color}-500 rounded-full`} />
      {pct}% Ready
    </span>
  );
}

function Field({ label, value, confidence }) {
  if (!value) return null;
  const pct = confidence != null ? (confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence)) : null;
  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-700/40 rounded-xl border border-gray-100 dark:border-slate-600/50">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{String(value)}</p>
      {pct != null && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${pct >= 95 ? 'bg-emerald-500' : pct >= 85 ? 'bg-blue-500' : 'bg-amber-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{pct}%</span>
        </div>
      )}
    </div>
  );
}

export default function PreparedClaimReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const [claim, setClaim] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE}/api/claims`, { headers })
        .then(r => r.json())
        .then(data => {
          const all = Array.isArray(data) ? data : (data.claims || data.invoices || []);
          return all.find(c => String(c.id) === String(id));
        }),
      fetch(`${API_BASE}/api/claims/${id}/confidence`, { headers })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
    ]).then(([claimData, confData]) => {
      setClaim(claimData || null);
      setConfidence(confData || null);
      setLoading(false);
    });
  }, [token, id]);

  useEffect(() => {
    if (!token || !id) return;
    setSummaryLoading(true);
    fetch(`${API_BASE}/api/claims/${id}/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.summary) setSummary(data.summary);
        setSummaryLoading(false);
      })
      .catch(() => setSummaryLoading(false));
  }, [token, id]);

  if (loading) {
    return (
      <ImprovedMainLayout title="Adjuster-Ready Packet">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 dark:text-gray-400">Preparing adjuster-ready packet...</p>
          </div>
        </div>
      </ImprovedMainLayout>
    );
  }

  if (!claim) {
    return (
      <ImprovedMainLayout title="Adjuster-Ready Packet">
        <div className="text-center py-20 space-y-4">
          <p className="text-gray-500 dark:text-gray-400">Claim not found</p>
          <button onClick={() => navigate('/claims')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
            View All Claims
          </button>
        </div>
      </ImprovedMainLayout>
    );
  }

  const claimNumber = claim.claim_number || claim.invoice_number || `CLM-${id}`;
  const provider = claim.vendor || claim.provider || '';
  const amount = claim.amount || claim.estimated_value || '';
  const policyNumber = claim.policy_number || '';
  const dateOfLoss = claim.date_of_loss || claim.date || '';
  const claimType = claim.claim_type || claim.doc_type || '';
  const icd = claim.icd || '';
  const cpt = claim.cpt || '';
  const claimantName = claim.policyholder_name || claim.claimant_name || '';
  const overallConf = confidence?.overall_confidence;
  const scores = confidence?.confidence_scores || {};
  const status = claim.approval_status || claim.status || 'pending';

  const statusMap = {
    pending: { label: 'Pending Review', color: 'amber' },
    approved: { label: 'Approved', color: 'emerald' },
    rejected: { label: 'Rejected', color: 'red' },
    fraud_detected: { label: 'Flagged', color: 'red' },
  };
  const st = statusMap[status] || statusMap.pending;

  return (
    <ImprovedMainLayout title="Adjuster-Ready Packet">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Adjuster-Ready Claim Packet</p>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {claimNumber}
              </h1>
              {claimantName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{claimantName}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ReadinessBadge score={overallConf} />
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-${st.color}-100 text-${st.color}-700 dark:bg-${st.color}-900/30 dark:text-${st.color}-400`}>
                {st.label}
              </span>
            </div>
          </div>

          {(summary || summaryLoading) && (
            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">First-Pass Summary</p>
              {summaryLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  Generating summary...
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
              )}
            </div>
          )}

          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Extracted Fields</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Claimant" value={claimantName} confidence={scores.claimant_name} />
              <Field label="Policy Number" value={policyNumber} confidence={scores.policy_number} />
              <Field label="Date of Loss" value={dateOfLoss ? new Date(dateOfLoss).toLocaleDateString() : ''} confidence={scores.date_of_loss} />
              <Field label="Claim Type" value={claimType} confidence={scores.claim_type} />
              <Field label="Billed Amount" value={amount ? `$${Number(amount).toLocaleString()}` : ''} confidence={scores.amount} />
              <Field label="Provider" value={provider} confidence={scores.vendor} />
            </div>
          </div>

          {(icd || cpt) && (
            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Medical Codes</p>
              <div className="grid grid-cols-2 gap-3">
                {cpt && (
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/40 rounded-xl border border-gray-100 dark:border-slate-600/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CPT Codes</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{cpt}</p>
                  </div>
                )}
                {icd && (
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/40 rounded-xl border border-gray-100 dark:border-slate-600/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ICD-10 Codes</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{icd}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {overallConf != null && (
            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Claim Readiness</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {overallConf <= 1 ? Math.round(overallConf * 100) : Math.round(overallConf)}%
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${overallConf <= 1 ? overallConf * 100 : overallConf}%` }}
                />
              </div>
            </div>
          )}

          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Checks</p>
            <div className="space-y-3">
              <DuplicateWarning claimId={id} token={token} />
              <ConfidenceIndicator claimId={id} token={token} />
            </div>
          </div>

          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-slate-700">
            <ClaimChronology claimId={id} token={token} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>What happened:</strong> ClarifyOps read the uploaded document, extracted key fields, validated medical codes, checked for duplicates, and prepared this summary — work that typically takes 30-45 minutes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/batch-upload')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            Upload Another File
          </button>
          <button
            onClick={() => navigate('/claims')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
          >
            View All Claims
          </button>
        </div>
      </div>
    </ImprovedMainLayout>
  );
}
