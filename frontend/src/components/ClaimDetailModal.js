import React, { useState, useEffect, useRef } from 'react';
import TagEditor from './TagEditor';
import CTAButton from './ui/CTAButton';
import { API_BASE } from '../api';
import DocumentViewer from './DocumentViewer';
import ICDCPTField from './ICDCPTField';
import CommentThread from './CommentThread';
import FlaggedCodeChat from './FlaggedCodeChat';

export default function ClaimDetailModal({ open, invoice, onClose, onUpdate, token }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', date: '', amount: '', vendor: '', icd: '', cpt: '' });
  const [timeline, setTimeline] = useState([]);
  const [vendorSuggestions, setVendorSuggestions] = useState([]);
  const [amountSuggestions, setAmountSuggestions] = useState([]);
  const dialogRef = useRef(null);
  const lastFocused = useRef(null);
  const scrollPos = useRef(0);

  useEffect(() => {
    if (invoice) {
      setForm({
        invoice_number: invoice.invoice_number || '',
        date: invoice.date ? invoice.date.substring(0, 10) : '',
        amount: invoice.amount || '',
        vendor: invoice.vendor || '',
        icd: invoice.icd || '',
        cpt: invoice.cpt || '',
      });
      if (token) {
        fetch(`${API_BASE}/api/invoices/${invoice.id}/timeline`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setTimeline(data);
            else if (Array.isArray(data.timeline)) setTimeline(data.timeline);
            else setTimeline([]);
          })
          .catch((err) => console.error('Timeline fetch failed:', err));
      }
    }
  }, [invoice, token]);

  useEffect(() => {
    if (!token || !form.vendor) return;
    const q = encodeURIComponent(form.vendor);
    fetch(`${API_BASE}/api/vendors/match?q=${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setVendorSuggestions(data.matches || []))
      .catch(() => {});
  }, [form.vendor, token]);

  useEffect(() => {
    if (!token || !form.amount) return;
    const q = encodeURIComponent(form.amount);
    fetch(`${API_BASE}/api/invoices/amount-suggestions?q=${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAmountSuggestions(data.matches || []))
      .catch(() => {});
  }, [form.amount, token]);

  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement;
      const node = dialogRef.current;
      const handleKey = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab' && node) {
          const focusable = node.querySelectorAll(
            'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', handleKey);
      node && node.focus();
      scrollPos.current = window.scrollY;
      window.history.pushState({ modal: true }, '');
      const pop = () => onClose();
      window.addEventListener('popstate', pop);
      return () => {
        document.removeEventListener('keydown', handleKey);
        window.removeEventListener('popstate', pop);
        window.scrollTo(0, scrollPos.current);
        lastFocused.current && lastFocused.current.focus();
      };
    }
  }, [open, onClose]);

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
    <div
      data-testid="claim-detail-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 transition-all ease-in-out"
      style={{ transitionDuration: 'var(--motion-modal)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative bg-white dark:bg-gray-800 p-4 rounded-t-lg sm:rounded-lg shadow-lg w-full h-full sm:h-auto sm:w-96 overflow-y-auto transition-all ease-in-out"
        style={{ transitionDuration: 'var(--motion-modal)' }}
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
        tabIndex={-1}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center btn btn-ghost"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-2">Claim #{invoice.invoice_number}</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold mr-2">ID:</span>{invoice.id}
          </div>
          <div>
            <span className="font-semibold mr-2">Service Date:</span>
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
              <>
                <input
                  type="text"
                  list="amount-suggest"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="input px-1 text-sm w-full"
                />
                <datalist id="amount-suggest">
                  {amountSuggestions.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </>
            ) : (
              invoice.amount
            )}
          </div>
          <div>
            <span className="font-semibold mr-2">Provider:</span>
            {editMode ? (
              <>
                <input
                  type="text"
                  list="vendor-suggest"
                  value={form.vendor}
                  onChange={(e) => handleChange('vendor', e.target.value)}
                  className="input px-1 text-sm w-full"
                />
                <datalist id="vendor-suggest">
                  {vendorSuggestions.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </>
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
          <div>
            <span className="font-semibold mr-2">Tags:</span>
            <TagEditor
              tags={invoice.tags || []}
              onAddTag={async (tag) => {
                  await fetch(`${API_BASE}/api/invoices/${invoice.id}/tags`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ tag }),
                }).then(() => {});
              }}
              onRemoveTag={async (tag) => {
                const newTags = (invoice.tags || []).filter((t) => t !== tag);
                  await fetch(`${API_BASE}/api/invoices/${invoice.id}/update-tags`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ tags: newTags }),
                }).then(() => {});
              }}
            />
          </div>
        <div className="mt-3">
          <h3 className="font-semibold text-sm mb-1">Document</h3>
          <DocumentViewer
            sections={invoice.sections || []}
            claim={invoice.claim || {}}
            findings={invoice.aiFindings || {}}
          />
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-sm mb-1">Codes</h3>
          <ICDCPTField
            initialICD={invoice.icd || ''}
            initialCPT={invoice.cpt || ''}
            suggestion={invoice.suggestions || {}}
            onChange={(vals) => {
              handleChange('icd', vals.icd);
              handleChange('cpt', vals.cpt);
            }}
          />
          <FlaggedCodeChat code={invoice.flaggedCode} />
        </div>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-sm mb-1">Status History</h3>
          <ul className="text-xs max-h-32 overflow-y-auto space-y-1">
            {invoice.approval_history?.map((h, i) => (
              <li key={i}>{new Date(h.date).toLocaleString()} - {h.step} {h.status}</li>
            ))}
            {Array.isArray(timeline) &&
              timeline.map((t, i) => (
                <li key={`tl-${i}`}>{new Date(t.created_at).toLocaleString()} - {t.action}</li>
              ))}
          </ul>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-sm mb-1">Comments</h3>
          <CommentThread claimId={invoice.id} token={token} />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          {editMode ? (
            <>
              <CTAButton onClick={handleSave} title="Save" className="px-4 py-2">Save</CTAButton>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 transition-all duration-300 ease-in-out" title="Cancel">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="bg-indigo-600 text-white px-4 py-2 rounded transition-all duration-300 ease-in-out" title="Edit">Edit</button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all duration-300 ease-in-out"
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
