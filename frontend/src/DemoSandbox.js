import React, { useEffect, useState } from 'react';
import ProgressBar from './components/ProgressBar';
import { API_BASE } from './api';
import PageHeader from './components/PageHeader';

export default function DemoSandbox() {
  const [csvText, setCsvText] = useState('');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/demo.csv')
      .then(res => res.text())
      .then(setCsvText)
      .catch(() => setCsvText(''));
  }, []);

  const parseAndSummarize = async () => {
    setStep(2);
    const lines = csvText.trim().split(/\r?\n/);
    const heads = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(l => {
      const vals = l.split(',');
      const obj = {};
      heads.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
      return obj;
    });
    const errs = [];
    rows.forEach((r, i) => {
      if (!r.invoice_number) errs.push(`Row ${i + 1}: Missing invoice_number`);
      if (!r.date) errs.push(`Row ${i + 1}: Missing date`);
      else if (isNaN(Date.parse(r.date))) errs.push(`Row ${i + 1}: Date is not valid`);
      if (!r.amount) errs.push(`Row ${i + 1}: Missing amount`);
      else if (isNaN(parseFloat(r.amount))) errs.push(`Row ${i + 1}: Amount is not a number`);
      if (!r.vendor) errs.push(`Row ${i + 1}: Missing vendor`);
    });
    setErrors(errs);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/invoices/summarize-errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: errs })
      });
      const data = await res.json();
      if (res.ok && data.summary) setSummary(data.summary);
    } catch (e) {
      setSummary('Failed to generate summary.');
    } finally {
      setLoading(false);
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gradient-to-br from-purple-50 via-indigo-100 to-indigo-200 dark:from-purple-900 dark:via-indigo-900 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <PageHeader title="ClarifyOps / AI Dashboard" subtitle="Interactive Demo Sandbox" />
        </div>
        {step === 1 && (
          <>
            <p className="text-sm text-center">Preview of sample invoice CSV:</p>
            <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">{csvText}</pre>
            <div className="text-center">
              <button className="btn btn-primary" onClick={parseAndSummarize}>See it in Action</button>
            </div>
          </>
        )}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <p className="text-sm">Processing sample CSV...</p>
            <ProgressBar value={loading ? 60 : 100} />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">AI Summary</h2>
            <pre className="bg-white dark:bg-gray-800 p-4 rounded whitespace-pre-wrap text-sm">{summary}</pre>
            <h3 className="font-semibold mt-4">Detected Issues</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {errors.map((e, i) => (<li key={i}>{e}</li>))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
