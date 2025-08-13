import React from 'react';
import MainLayout from './components/MainLayout';
import PageHeader from './components/PageHeader';
import { ArrowRight } from 'lucide-react';

export default function ClaimsBrandingPreview() {
  return (
    <MainLayout title="ClarifyOps › ClarifyClaims">
      <PageHeader title="ClarifyOps › ClarifyClaims" subtitle="Claims Branding Preview" />
      <p className="text-sm text-gray-500 mb-4">
        How ClarifyClaims, ClarifyOps, and AuditFlow connect
      </p>
      <div className="flex items-center justify-center gap-4 mt-8">
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">ClarifyClaims</div>
        <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">ClarifyOps</div>
        <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">AuditFlow</div>
      </div>
    </MainLayout>
  );
}

