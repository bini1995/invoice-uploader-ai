import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

export default function DuplicateWarning({ claimId, token, onNavigate }) {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [comparing, setComparing] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (!claimId || !token) return;
    fetch(`${API_BASE}/api/claims/${claimId}/duplicates`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        setDuplicates(d.duplicates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [claimId, token]);

  const handleResolve = async (flagId, status) => {
    try {
      await fetch(`${API_BASE}/api/claims/${claimId}/duplicates/${flagId}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      setDuplicates(prev => prev.map(d => 
        d.id === flagId ? { ...d, status } : d
      ));

      if (status === 'confirmed') {
        showMsg('Duplicate confirmed - claim flagged for review');
      } else {
        showMsg('Duplicate dismissed');
      }
    } catch (err) {
      console.error('Failed to resolve duplicate:', err);
    }
  };

  const handleFlagFraud = async (flagId, matchedDocId) => {
    try {
      await fetch(`${API_BASE}/api/claims/${claimId}/duplicates/${flagId}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      await fetch(`${API_BASE}/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'flagged' })
      }).catch(() => {});

      setDuplicates(prev => prev.map(d =>
        d.id === flagId ? { ...d, status: 'confirmed', flagged_fraud: true } : d
      ));
      showMsg('Claim flagged as potential fraud and escalated');
    } catch (err) {
      console.error('Failed to flag fraud:', err);
    }
  };

  const showMsg = (text) => {
    setStatusMsg(text);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  if (loading || duplicates.length === 0) return null;

  const pendingCount = duplicates.filter(d => d.status === 'pending').length;

  return (
    <div className={`border rounded-lg overflow-hidden ${pendingCount > 0 ? 'border-orange-300 dark:border-orange-700' : 'border-gray-200 dark:border-gray-700'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm ${
          pendingCount > 0 
            ? 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30' 
            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
        } transition-colors`}
      >
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 ${pendingCount > 0 ? 'text-orange-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="font-medium">
            {pendingCount > 0 
              ? `${pendingCount} Potential Duplicate${pendingCount !== 1 ? 's' : ''} Found` 
              : `${duplicates.length} Duplicate Check${duplicates.length !== 1 ? 's' : ''} Resolved`}
          </span>
        </div>
        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {statusMsg && (
        <div className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-xs font-medium text-green-700 dark:text-green-400 border-b border-green-100 dark:border-green-800">
          {statusMsg}
        </div>
      )}

      {expanded && (
        <div className="divide-y dark:divide-gray-700">
          {duplicates.map(dup => (
            <div key={dup.id} className="px-3 py-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {dup.matched_file_name || `Claim #${dup.matched_document_id}`}
                    </span>
                    <SimilarityBadge score={dup.similarity_score} />
                    {dup.flagged_fraud && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-600 text-white">
                        FRAUD
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {dup.matched_doc_type && <span className="capitalize">{dup.matched_doc_type.replace(/_/g, ' ')}</span>}
                    {dup.matched_created_at && (
                      <span> - {new Date(dup.matched_created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {dup.matched_fields && Object.keys(dup.matched_fields).length > 0 && (
                <div className="space-y-0.5">
                  {Object.entries(dup.matched_fields).map(([field, info]) => (
                    <div key={field} className="flex items-center gap-1 text-[10px]">
                      <span className="text-gray-400 capitalize w-20 flex-shrink-0">
                        {field.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        "{info.this_value}" = "{info.match_value}"
                      </span>
                      <span className={`flex-shrink-0 ${info.similarity >= 90 ? 'text-red-500' : info.similarity >= 70 ? 'text-orange-500' : 'text-yellow-500'}`}>
                        ({info.similarity}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {comparing === dup.id && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-[10px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">This Claim</p>
                      {dup.matched_fields && Object.entries(dup.matched_fields).map(([field, info]) => (
                        <p key={field} className="text-gray-600 dark:text-gray-400">
                          <span className="capitalize text-gray-400">{field.replace(/_/g, ' ')}:</span> {info.this_value || 'N/A'}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Matched Claim</p>
                      {dup.matched_fields && Object.entries(dup.matched_fields).map(([field, info]) => (
                        <p key={field} className="text-gray-600 dark:text-gray-400">
                          <span className="capitalize text-gray-400">{field.replace(/_/g, ' ')}:</span> {info.match_value || 'N/A'}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {dup.status === 'pending' ? (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleResolve(dup.id, 'confirmed')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-md transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Duplicate
                    </button>
                    <button
                      onClick={() => handleResolve(dup.id, 'dismissed')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleFlagFraud(dup.id, dup.matched_document_id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Flag as Fraud
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate(dup.matched_document_id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Matched Claim
                      </button>
                    )}
                    <button
                      onClick={() => setComparing(comparing === dup.id ? null : dup.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {comparing === dup.id ? 'Hide Comparison' : 'Side-by-Side Compare'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    dup.status === 'confirmed' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {dup.status === 'confirmed' ? 'Confirmed Duplicate' : 'Dismissed'}
                  </span>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate(dup.matched_document_id)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View match
                    </button>
                  )}
                  <button
                    onClick={() => setComparing(comparing === dup.id ? null : dup.id)}
                    className="text-[10px] text-gray-500 dark:text-gray-400 hover:underline"
                  >
                    {comparing === dup.id ? 'Hide' : 'Compare'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SimilarityBadge({ score }) {
  if (!score && score !== 0) return null;
  const pct = Math.round(parseFloat(score));
  let colors;
  if (pct >= 85) {
    colors = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  } else if (pct >= 70) {
    colors = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  } else {
    colors = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${colors}`}>
      {pct}% match
    </span>
  );
}

export function DuplicateBadge({ count }) {
  if (!count || count === 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      {count}
    </span>
  );
}
