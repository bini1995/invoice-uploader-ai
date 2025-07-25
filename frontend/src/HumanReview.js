import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

function HumanReview() {
  const token = localStorage.getItem('token') || '';
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/claims/review-queue`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setDocs(data.documents || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const badge = (s) => {
    const map = {
      needs_review: 'bg-yellow-200 text-yellow-800',
      incorrect: 'bg-red-200 text-red-800',
      correct: 'bg-green-200 text-green-800'
    };
    return <span className={`px-1 rounded text-xs ${map[s] || 'bg-gray-200 text-gray-800'}`}>{s}</span>;
  };

  return (
    <MainLayout title="Human Review" helpTopic="review">
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="px-2 py-1">ID</th>
              <th className="px-2 py-1">Title</th>
              <th className="px-2 py-1">Type</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Reason</th>
              <th className="px-2 py-1">Assignee</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4">Loading...</td>
              </tr>
            ) : (
              docs.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="px-2 py-1">{d.id}</td>
                  <td className="px-2 py-1">{d.doc_title}</td>
                  <td className="px-2 py-1">{d.doc_type}</td>
                  <td className="px-2 py-1">{badge(d.status)}</td>
                  <td className="px-2 py-1">{d.reason || '-'}</td>
                  <td className="px-2 py-1">{d.assigned_to || '-'}</td>
                  <td className="px-2 py-1">
                    <Link to={`/results/${d.id}`} className="text-indigo-600">
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default HumanReview;
