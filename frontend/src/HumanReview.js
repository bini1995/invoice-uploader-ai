import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';
import { getStatusDetails } from './theme/statuses';

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
    const { class: cls, icon: Icon } = getStatusDetails(s);
    return (
      <span className={`px-1 rounded text-xs inline-flex items-center gap-1 ${cls}`}>
        <Icon className="w-3 h-3" aria-hidden="true" />
        {s}
      </span>
    );
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
