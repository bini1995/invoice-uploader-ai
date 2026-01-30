import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import { Button } from './components/ui/Button';
import { API_BASE } from './api';

export default function OnboardingWizard() {
  const token = localStorage.getItem('token') || '';
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState({ vendor: '', assignee: '' });

  const uploadSample = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('invoiceFile', file);
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/claims/parse-sample`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setParsed(data);
        setTemplate(t => ({ ...t, vendor: data.invoice.vendor }));
        setStep(2);
      } else {
        alert(data.message || 'Failed to parse');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = () => {
    const templates = JSON.parse(localStorage.getItem('vendorTemplates') || '{}');
    if (template.vendor) {
      templates[template.vendor] = template.assignee;
      localStorage.setItem('vendorTemplates', JSON.stringify(templates));
    }
    setStep(4);
  };

  return (
    <MainLayout title="Getting Started" helpTopic="onboarding">
      <div className="max-w-2xl mx-auto space-y-6">
        {step === 1 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">1. Upload an invoice sample</h2>
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer focus:outline-none"
            />
            <Button onClick={uploadSample} disabled={!file || loading} className="mt-2">
              {loading ? 'Uploading...' : 'Next'}
            </Button>
          </div>
        )}

        {step === 2 && parsed && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">2. Review parsed fields</h2>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Invoice #:</span> {parsed.invoice.invoice_number}</div>
              <div><span className="font-medium">Date:</span> {parsed.invoice.date}</div>
              <div><span className="font-medium">Amount:</span> {parsed.invoice.amount}</div>
              <div><span className="font-medium">Vendor:</span> {parsed.invoice.vendor}</div>
              <div><span className="font-medium">Suggested Tags:</span> {(parsed.tags || []).join(', ') || 'None'}</div>
            </div>
            <Button onClick={() => setStep(3)} className="mt-2">Next</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">3. Save vendor template</h2>
            <div className="space-y-2 text-sm">
              <div>
                <label className="block font-medium mb-1">Vendor</label>
                <input
                  className="input w-full"
                  value={template.vendor}
                  onChange={e => setTemplate({ ...template, vendor: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Default Assignee</label>
                <input
                  className="input w-full"
                  value={template.assignee}
                  onChange={e => setTemplate({ ...template, assignee: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={saveTemplate} className="mt-2">Save Template</Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold">All set!</h2>
            <p className="text-sm">Your template has been saved. You're ready to start uploading invoices.</p>
            <Button onClick={() => (window.location.href = '/operations')}>Go to App</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
