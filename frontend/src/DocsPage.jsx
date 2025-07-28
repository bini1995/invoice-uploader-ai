import React from 'react';
import MainLayout from './components/MainLayout';
import PageHeader from './components/PageHeader';
import { API_BASE } from './api';

export default function DocsPage() {
  return (
    <MainLayout title="Docs">
      <PageHeader title="Developer Docs" subtitle="Integration Guide" />
      <div className="space-y-6">
        <section>
          <h2 className="font-semibold text-lg">API Key Instructions</h2>
          <p className="text-sm">Generate a key in Settings and include it in requests:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
Authorization: Bearer YOUR_KEY
          </pre>
        </section>
        <section>
          <h2 className="font-semibold text-lg">Claim Upload Example</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
curl -X POST -H "Authorization: Bearer YOUR_KEY" \
     -F file=@claim.pdf {API_BASE}/api/claims
          </pre>
        </section>
        <section>
          <h2 className="font-semibold text-lg">Export Formats</h2>
          <p className="text-sm">Export claim data as CSV or JSON from the dashboard or via the export endpoint.</p>
        </section>
        <section>
          <h2 className="font-semibold text-lg">Status Lifecycle</h2>
          <p className="text-sm">Claims move through pending, processing and done statuses. Failed extractions show an error state.</p>
        </section>
      </div>
    </MainLayout>
  );
}
