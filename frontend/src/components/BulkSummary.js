import React from 'react';
import { useTranslation } from 'react-i18next';

export default function BulkSummary({ open, summary, onClose }) {
  const { t } = useTranslation();
  if (!open || !summary) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg w-96 max-w-full transition-all duration-300 ease-in-out">
        <h2 className="text-lg font-semibold mb-2">{t('uploadSummary')}</h2>
        <ul className="text-sm mb-4 space-y-1">
          <li><strong>Valid:</strong> {summary.valid}</li>
          <li><strong>Flagged:</strong> {summary.flagged}</li>
          <li><strong>Total Spend:</strong> ${summary.total.toFixed(2)}</li>
          {summary.topVendors.length > 0 && (
            <li><strong>Top Vendors:</strong> {summary.topVendors.join(', ')}</li>
          )}
          {summary.tags.length > 0 && (
            <li><strong>Suggested Tags:</strong> {summary.tags.join(', ')}</li>
          )}
        </ul>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm transition-all duration-300 ease-in-out">{t('close')}</button>
        </div>
      </div>
    </div>
  );
}
