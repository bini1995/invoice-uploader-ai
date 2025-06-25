import React, { useState } from 'react';
import GraphView from './GraphView';
import { useTranslation } from 'react-i18next';

export default function InvoiceSnapshotView({ open, invoice, onClose, token, tenant, onAddComment }) {
  const [comment, setComment] = useState('');
  const { t } = useTranslation();
  if (!open || !invoice) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`absolute right-0 top-0 h-full w-96 max-w-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>\
        <div className="p-4 space-y-3 h-full overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Invoice #{invoice.invoice_number}</h2>
            <button
              onClick={onClose}
              className="text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close snapshot"
            >
              {t('close')}
            </button>
          </div>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Vendor:</span> {invoice.vendor}</div>
            <div><span className="font-medium">Amount:</span> {invoice.amount}</div>
            <div><span className="font-medium">Date:</span> {invoice.date ? new Date(invoice.date).toLocaleDateString() : ''}</div>
            <div><span className="font-medium">Status:</span> {invoice.approval_status || 'Pending'}</div>
          </div>
          <GraphView token={token} tenant={tenant} />
          <div>
            <h3 className="font-semibold text-sm mb-1">Comments</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {invoice.comments?.length ? (
                invoice.comments.map((c, i) => (
                  <div key={i} className="text-xs bg-gray-100 rounded p-1">{c.text}</div>
                ))
              ) : (
                <em className="text-xs text-gray-500">No comments</em>
              )}
            </div>
            <div className="flex mt-1">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input text-xs flex-1 px-1"
                placeholder="Add comment"
              />
              <button
                onClick={() => { onAddComment(invoice.id, comment); setComment(''); }}
                className="bg-indigo-600 text-white text-xs px-2 py-1 ml-1 rounded"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
