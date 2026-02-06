import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

const EVENT_ICONS = {
  consultation: { icon: '🩺', color: 'bg-blue-500', label: 'Consultation' },
  diagnosis: { icon: '📋', color: 'bg-purple-500', label: 'Diagnosis' },
  treatment: { icon: '💊', color: 'bg-green-500', label: 'Treatment' },
  procedure: { icon: '🔬', color: 'bg-red-500', label: 'Procedure' },
  prescription: { icon: '💊', color: 'bg-teal-500', label: 'Prescription' },
  lab_test: { icon: '🧪', color: 'bg-yellow-500', label: 'Lab Test' },
  imaging: { icon: '📷', color: 'bg-indigo-500', label: 'Imaging' },
  hospitalization: { icon: '🏥', color: 'bg-red-600', label: 'Hospitalization' },
  follow_up: { icon: '🔄', color: 'bg-sky-500', label: 'Follow-up' },
  referral: { icon: '📤', color: 'bg-orange-500', label: 'Referral' },
  discharge: { icon: '🏠', color: 'bg-emerald-500', label: 'Discharge' },
  injury: { icon: '🤕', color: 'bg-rose-500', label: 'Injury' },
  incident: { icon: '⚠️', color: 'bg-amber-500', label: 'Incident' },
  unknown: { icon: '📌', color: 'bg-gray-500', label: 'Event' },
};

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'unknown') return 'Date Unknown';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function ClaimChronology({ claimId, token }) {
  const [events, setEvents] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!claimId || !token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/claims/${claimId}/chronology`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEvents(Array.isArray(data.events) ? data.events : []);
        setGeneratedAt(data.generated_at);
      })
      .catch(() => setError('Failed to load chronology'))
      .finally(() => setLoading(false));
  }, [claimId, token]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/claims/${claimId}/chronology/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Generation failed');
      } else {
        setEvents(Array.isArray(data.events) ? data.events : []);
        setGeneratedAt(data.generated_at);
      }
    } catch {
      setError('Failed to generate chronology');
    } finally {
      setGenerating(false);
    }
  };

  const eventMeta = (type) => EVENT_ICONS[type] || EVENT_ICONS.unknown;

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
          Medical Chronology
        </h3>
        {events.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-2">
          {loading && (
            <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading chronology...
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 mb-2">{error}</p>
          )}

          {!loading && events.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                No chronology generated yet.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Chronology
                  </>
                )}
              </button>
            </div>
          )}

          {events.length > 0 && (
            <>
              <div className="relative ml-3">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-3">
                  {events.map((event, i) => {
                    const meta = eventMeta(event.event_type);
                    return (
                      <div key={i} className="relative flex gap-3 pl-1">
                        <div className={`relative z-10 flex-shrink-0 w-5 h-5 rounded-full ${meta.color} flex items-center justify-center text-[10px] leading-none ring-2 ring-white dark:ring-gray-800`}>
                          <span>{meta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {formatDate(event.date)}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white ${meta.color}`}>
                              {meta.label}
                            </span>
                            {event.cost && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                                {event.cost}
                              </span>
                            )}
                          </div>
                          {event.provider && (
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                              {event.provider}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                            {event.description}
                          </p>
                          {((event.codes?.cpt?.length > 0) || (event.codes?.icd10?.length > 0)) && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {event.codes.cpt?.map((c, ci) => (
                                <span key={`cpt-${ci}`} className="text-[10px] px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-mono">
                                  CPT:{c}
                                </span>
                              ))}
                              {event.codes.icd10?.map((c, ci) => (
                                <span key={`icd-${ci}`} className="text-[10px] px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-mono">
                                  ICD:{c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                {generatedAt && (
                  <span className="text-[10px] text-gray-400">
                    Generated {new Date(generatedAt).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                >
                  {generating ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
