import React from 'react';
import MainLayout from './components/MainLayout';
import PageHeader from './components/PageHeader';
import { ArrowRight } from 'lucide-react';

export default function ClaimsBrandingPreview() {
  return (
    <MainLayout title="Claims Branding Preview">
      <PageHeader
        title="Claims Branding Preview"
        subtitle="How ClarifyClaims, OpsClaim, and AuditFlow connect"
      />
      <div className="flex items-center justify-center gap-4 mt-8">
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">ClarifyClaims</div>
        <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">OpsClaim</div>
        <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        <div className="p-4 rounded bg-indigo-100 dark:bg-indigo-900">AuditFlow</div>
      </div>
    </MainLayout>
  );
}

