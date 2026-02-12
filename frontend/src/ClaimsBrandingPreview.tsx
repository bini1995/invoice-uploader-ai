import React from 'react';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import PageHeader from './components/PageHeader';
import { ArrowRight } from 'lucide-react';

export default function ClaimsBrandingPreview() {
  return (
    <ImprovedMainLayout title="Claims Branding Preview">
      <PageHeader title="ClarifyOps" subtitle="Claims Branding Preview" />
      <p className="text-sm text-gray-500 mb-4">
        How Claims Processing, ClarifyOps, and AuditFlow connect
      </p>
      <div className="flex items-center justify-center gap-4 mt-8">
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">Claims Processing</div>
        <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">ClarifyOps</div>
        <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">AuditFlow</div>
      </div>
    </ImprovedMainLayout>
  );
}

