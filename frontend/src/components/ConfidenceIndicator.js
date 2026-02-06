import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

function getConfidenceColor(score) {
  if (score >= 85) return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', bar: 'bg-green-500', label: 'High' };
  if (score >= 60) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', bar: 'bg-yellow-500', label: 'Medium' };
  return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', bar: 'bg-red-500', label: 'Low' };
}

function ConfidenceBadge({ score }) {
  if (score === null || score === undefined) return null;
  const pct = typeof score === 'number' && score <= 1 ? Math.round(score * 100) : Math.round(score);
  const colors = getConfidenceColor(pct);
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.bar}`} />
      {pct}%
    </span>
  );
}

const FIELD_LABELS = {
  claim_id: 'Claim ID',
  claimant_name: 'Claimant Name',
  date_of_incident: 'Date of Incident',
  policy_number: 'Policy Number',
  policy_id: 'Policy ID',
  total_claimed_amount: 'Claimed Amount',
  loss_description: 'Description',
  cpt_codes: 'CPT Codes',
  icd10_codes: 'ICD-10 Codes',
};

export default function ConfidenceIndicator({ claimId, token, inline = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!claimId || !token) return;
    fetch(`${API_BASE}/api/claims/${claimId}/confidence`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [claimId, token]);

  if (loading) return <div className="text-xs text-gray-400">Loading confidence...</div>;
  if (!data || !data.extracted) return null;

  const overallPct = data.overall_confidence !== null
    ? (data.overall_confidence <= 1 ? Math.round(data.overall_confidence * 100) : Math.round(data.overall_confidence))
    : null;

  const overallColors = overallPct !== null ? getConfidenceColor(overallPct) : null;
  const scores = data.confidence_scores || {};
  const hasScores = Object.keys(scores).length > 0;

  if (inline) {
    return <ConfidenceBadge score={data.overall_confidence} />;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-medium">AI Confidence</span>
        </div>
        <div className="flex items-center gap-2">
          {overallPct !== null && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${overallColors.bar}`} style={{ width: `${overallPct}%` }} />
              </div>
              <span className={`text-xs font-semibold ${overallColors.text}`}>{overallPct}%</span>
            </div>
          )}
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && hasScores && (
        <div className="px-3 py-2 space-y-1.5">
          {Object.entries(FIELD_LABELS).map(([key, label]) => {
            const score = scores[key];
            if (score === undefined || score === null) return null;
            const colors = getConfidenceColor(score);
            return (
              <div key={key} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-shrink-0" style={{ minWidth: '100px' }}>
                  {label}
                </span>
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${colors.bar}`} style={{ width: `${score}%` }} />
                  </div>
                  <span className={`text-xs font-medium w-8 text-right ${colors.text}`}>{score}%</span>
                </div>
              </div>
            );
          })}
          <div className="pt-1 border-t mt-1">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Scores indicate AI extraction certainty. Fields below 60% may need manual review.
            </p>
          </div>
        </div>
      )}

      {expanded && !hasScores && (
        <div className="px-3 py-2 text-xs text-gray-500">
          Per-field confidence scores not available for this extraction.
        </div>
      )}
    </div>
  );
}

export { ConfidenceBadge };
