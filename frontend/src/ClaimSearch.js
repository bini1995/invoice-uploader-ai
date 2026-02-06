import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import { API_BASE } from './api';
import { ConfidenceBadge } from './components/ConfidenceIndicator';

export default function ClaimSearch() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/claims/semantic-search?q=${encodeURIComponent(q)}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Search failed');
      } else {
        setResults(data);
      }
    } catch (err) {
      setError('Unable to connect to search service');
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score) => {
    if (score >= 0.85) return 'text-green-600 dark:text-green-400';
    if (score >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const searchWithQuery = async (q) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/claims/semantic-search?q=${encodeURIComponent(q.trim())}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Search failed');
      } else {
        setResults(data);
      }
    } catch (err) {
      setError('Unable to connect to search service');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'claims with knee surgery',
    'auto accident in January',
    'dental procedures over $5000',
    'workers compensation back injury',
    'pharmacy claims for diabetes medication',
    'emergency room visits',
  ];

  return (
    <ImprovedMainLayout title="Search Claims">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Claims</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search across all your claims using natural language. Powered by AI semantic understanding.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "show me all claims with knee surgery" or "dental claims over $1000"'
              className="w-full pl-12 pr-24 py-3.5 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : 'Search'}
            </button>
          </div>
        </form>

        {!results && !loading && !error && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setQuery(ex); searchWithQuery(ex); }}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <svg className="animate-spin w-8 h-8 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Searching across your claims...</p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found <span className="font-semibold text-gray-900 dark:text-white">{results.count}</span> matching claim{results.count !== 1 ? 's' : ''} for "<span className="italic">{results.query}</span>"
              </p>
            </div>

            {results.count === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <svg className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">No matching claims found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try rephrasing your search</p>
              </div>
            ) : (
              <div className="border rounded-lg dark:border-gray-700 divide-y dark:divide-gray-700">
                {results.results.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => navigate(`/claims?highlight=${claim.id}`)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {claim.claim_number || claim.doc_title || claim.file_name}
                          </p>
                          {claim.doc_type && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize flex-shrink-0">
                              {claim.doc_type.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {claim.policyholder_name && (
                            <span>{claim.policyholder_name}</span>
                          )}
                          {claim.estimated_value && (
                            <span>${parseFloat(claim.estimated_value).toLocaleString()}</span>
                          )}
                          {claim.created_at && (
                            <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                          )}
                          {claim.status && (
                            <span className={`capitalize px-1.5 py-0.5 rounded ${
                              claim.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {claim.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-sm font-semibold ${getSimilarityColor(claim.similarity)}`}>
                          {Math.round(claim.similarity * 100)}% match
                        </span>
                        <ConfidenceBadge score={claim.overall_confidence} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ImprovedMainLayout>
  );
}
