import React, { useState, useEffect } from 'react';

export default function InvoiceDetailModal({ open, invoice, onClose, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', date: '', amount: '', vendor: '' });

  useEffect(() => {
    if (invoice) {
      setForm({
        invoice_number: invoice.invoice_number || '',
        date: invoice.date ? invoice.date.substring(0, 10) : '',
        amount: invoice.amount || '',
        vendor: invoice.vendor || '',
      });
    }
  }, [invoice]);

  if (!open || !invoice) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Object.entries(form).forEach(([field, value]) => {
      if (value !== (invoice[field] || '')) {
        onUpdate(invoice.id, field, value);
      }
    });
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-2">Invoice #{invoice.invoice_number}</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold mr-2">ID:</span>{invoice.id}
          </div>
          <div>
            <span className="font-semibold mr-2">Date:</span>
            {editMode ? (
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="input px-1 text-sm w-full"
              />
            ) : (
              invoice.date ? new Date(invoice.date).toLocaleDateString() : ''
            )}
          </div>
          <div>
            <span className="font-semibold mr-2">Amount:</span>
            {editMode ? (
              <input
                type="text"
                value={form.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="input px-1 text-sm w-full"
              />
            ) : (
              invoice.amount
            )}
          </div>
          <div>
            <span className="font-semibold mr-2">Vendor:</span>
            {editMode ? (
              <input
                type="text"
                value={form.vendor}
                onChange={(e) => handleChange('vendor', e.target.value)}
                className="input px-1 text-sm w-full"
              />
            ) : (
              invoice.vendor
            )}
          </div>
          <div>
            <span className="font-semibold mr-2">Status:</span>{invoice.approval_status || 'Pending'}
          </div>
          <div>
            <span className="font-semibold mr-2">Created:</span>
            {invoice.created_at ? new Date(invoice.created_at).toLocaleString() : ''}
          </div>
          <div>
            <span className="font-semibold mr-2">Updated:</span>
            {invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : ''}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          {editMode ? (
            <>
              <button onClick={handleSave} className="bg-indigo-600 text-white px-3 py-1 rounded" title="Save">Save</button>
              <button onClick={() => setEditMode(false)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700" title="Cancel">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="bg-indigo-600 text-white px-3 py-1 rounded" title="Edit">Edit</button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Close"
            aria-label="Close details"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
