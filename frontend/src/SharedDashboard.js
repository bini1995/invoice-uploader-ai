import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

function SharedDashboard() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/claims/dashboard/shared/${token}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <MainLayout title="Shared Dashboard"><p>Loading...</p></MainLayout>;
  if (!data) return <MainLayout title="Shared Dashboard"><p>Failed to load dashboard.</p></MainLayout>;

  return (
    <MainLayout title="Shared Dashboard">
      <div className="space-y-4">
        <div>Total Claim Documents: {data.totalInvoices}</div>
        <div>Total Amount: {data.totalAmount}</div>
        <div>Total Claim Document Spend This Month: {data.totalInvoicedThisMonth}</div>
        <div>Claim Documents Pending: {data.invoicesPending}</div>
        <div>Anomalies Found: {data.anomaliesFound}</div>
        <div>AI Suggestions: {data.aiSuggestions}</div>
      </div>
    </MainLayout>
  );
}

export default SharedDashboard;
