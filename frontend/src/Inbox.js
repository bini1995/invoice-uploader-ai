import React, { useEffect, useState, useCallback, useMemo } from 'react';
import MainLayout from './components/MainLayout';
import Skeleton from './components/Skeleton';
import { motion } from 'framer-motion';
import ChatSidebar from './components/ChatSidebar';
import { API_BASE } from './api';
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export default function Inbox() {
  const token = localStorage.getItem('token') || '';
  const tenant = localStorage.getItem('tenant') || 'default';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/${tenant}/invoices?status=Pending`, { headers });
      const data = await res.json();
      if (res.ok) setInvoices(data);
    } catch (err) {
      console.error('Inbox fetch error:', err);
    }
    setLoading(false);
  }, [token, tenant, headers]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const approve = async (id) => {
    await fetch(`${API_BASE}/api/${tenant}/invoices/${id}/approve`, {
      method: 'PATCH',
      headers
    }).catch(() => {});
    fetchInvoices();
  };

  const reject = async (id) => {
    await fetch(`${API_BASE}/api/${tenant}/invoices/${id}/reject`, {
      method: 'PATCH',
      headers
    }).catch(() => {});
    fetchInvoices();
  };

  const archive = async (id) => {
    await fetch(`${API_BASE}/api/${tenant}/invoices/${id}/archive`, {
      method: 'PATCH',
      headers,
    }).catch(() => {});
    fetchInvoices();
  };

  const openCopilot = (inv) => {
    setActiveInvoice(inv);
    setChatHistory([]);
    setCopilotOpen(true);
  };

  const handleCopilotAsk = async (question) => {
    if (!question.trim() || !activeInvoice) return;
    try {
      setLoadingChat(true);
      const res = await fetch(`${API_BASE}/api/${tenant}/invoices/${activeInvoice.id}/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory((h) => [...h, { type: 'chat', question, answer: data.answer }]);
      } else {
        setChatHistory((h) => [...h, { type: 'chat', question, answer: data.message || 'Error' }]);
      }
    } catch (err) {
      console.error('Copilot error:', err);
      setChatHistory((h) => [...h, { type: 'chat', question, answer: 'Failed to get answer' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedRows((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const toggleExpand = (id) => {
    setExpandedRows((r) =>
      r.includes(id) ? r.filter((x) => x !== id) : [...r, id]
    );
  };

  const bulkApprove = async () => {
    await fetch(`${API_BASE}/api/${tenant}/invoices/bulk/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ ids: selectedRows }),
    }).catch(() => {});
    setSelectedRows([]);
    fetchInvoices();
  };

  const bulkReject = async () => {
    await fetch(`${API_BASE}/api/${tenant}/invoices/bulk/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ ids: selectedRows }),
    }).catch(() => {});
    setSelectedRows([]);
    fetchInvoices();
  };

  const bulkAssign = async () => {
    const assignee = prompt('Assign to who?');
    if (!assignee) return;
    await fetch(`${API_BASE}/api/${tenant}/invoices/bulk/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ ids: selectedRows, assignee }),
    }).catch(() => {});
    setSelectedRows([]);
    fetchInvoices();
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === invoices.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(invoices.map((i) => i.id));
    }
  };

  const statusBadge = (s) => {
    const base = 'px-2 py-1 rounded text-xs font-medium';
    if (s === 'Approved') return <span className={`${base} bg-green-100 text-green-800`}>🟢 Approved</span>;
    if (s === 'Rejected') return <span className={`${base} bg-red-100 text-red-800`}>🔴 Rejected</span>;
    if (s === 'Flagged') return <span className={`${base} bg-red-100 text-red-800`}>🔴 Flagged</span>;
    return <span className={`${base} bg-yellow-100 text-yellow-800`}>🟡 Review Needed</span>;
  };

  return (
    <MainLayout title="Inbox" helpTopic="inbox">
      {selectedRows.length > 0 && (
        <div className="mb-2 flex gap-2">
          <button onClick={bulkApprove} className="btn bg-green-600 text-white text-xs">Approve All</button>
          <button onClick={bulkReject} className="btn bg-red-600 text-white text-xs">Reject All</button>
          <button onClick={bulkAssign} className="btn bg-indigo-600 text-white text-xs">Assign</button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center">
            <th className="px-2 py-2">
              <input type="checkbox" onChange={toggleSelectAll} checked={selectedRows.length === invoices.length && invoices.length > 0} />
            </th>
            <th className="px-2 py-2"></th>
            <th className="px-2 py-2" title="Invoice #">
              <DocumentTextIcon className="w-4 h-4 mx-auto" />
              <span className="sr-only">Invoice #</span>
            </th>
            <th className="px-2 py-2" title="Vendor">
              <BuildingOfficeIcon className="w-4 h-4 mx-auto" />
              <span className="sr-only">Vendor</span>
            </th>
            <th className="px-2 py-2" title="Amount">
              <CurrencyDollarIcon className="w-4 h-4 mx-auto" />
              <span className="sr-only">Amount</span>
            </th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Assignee</th>
            <th className="px-2 py-2">AI</th>
            <th className="px-2 py-2" title="Actions">
              <Cog6ToothIcon className="w-4 h-4 mx-auto" />
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="p-4"><Skeleton rows={5} height="h-4" /></td>
            </tr>
          ) : (
            invoices.map((inv) => {
              const status = inv.flagged ? 'Flagged' : inv.approval_status || 'Pending';
              const borderColor =
                status === 'Approved'
                  ? 'border-green-500'
                  : status === 'Flagged' || status === 'Rejected'
                  ? 'border-red-500'
                  : 'border-yellow-500';
              return (
                <React.Fragment key={inv.id}>
                  <motion.tr
                    className={`border-t hover:bg-gray-50 hover:shadow-sm transition-shadow ${borderColor} border-l-4`}
                    drag="x"
                    dragConstraints={{ left: -120, right: 0 }}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -100) archive(inv.id);
                    }}
                    whileDrag={{ scale: 1.02 }}
                  >
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={selectedRows.includes(inv.id)} onChange={() => toggleSelect(inv.id)} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => toggleExpand(inv.id)}>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedRows.includes(inv.id) ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                    <td className="px-3 py-2">{inv.invoice_number}</td>
                    <td className="px-3 py-2">{inv.vendor}</td>
                    <td className="px-3 py-2">${inv.amount}</td>
                    <td className="px-3 py-2">{statusBadge(status)}</td>
                    <td className="px-3 py-2 text-center">
                      {inv.assignee ? (
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${inv.assignee}`} alt={inv.assignee} className="h-6 w-6 rounded-full mx-auto" />
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {inv.flag_reason && (
                        <Tippy content={`AI flag: ${inv.flag_reason}`}>
                          <LightBulbIcon className="w-4 h-4 text-yellow-500 inline" />
                        </Tippy>
                      )}
                    </td>
                    <td className="px-3 py-2 space-x-1 flex justify-center relative">
                      <button
                        onClick={() => approve(inv.id)}
                        className="btn bg-green-600 hover:bg-green-700 text-white p-1"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => reject(inv.id)}
                        className="btn bg-red-600 hover:bg-red-700 text-white p-1"
                        title="Reject"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openCopilot(inv)}
                        className="btn bg-indigo-600 hover:bg-indigo-700 text-white p-1 relative"
                        title="Chat"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        {Array.isArray(inv.comments) && inv.comments.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-4 w-4 text-[10px] flex items-center justify-center">{inv.comments.length}</span>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                  {expandedRows.includes(inv.id) && (
                    <tr className="bg-gray-50">
                      <td></td>
                      <td colSpan="8" className="px-4 py-2 text-xs text-left">
                        PO#: {inv.po_number || inv.po_id || 'N/A'} | Tags: {inv.tags?.join(', ') || 'None'} | Uploaded:{' '}
                        {inv.created_at ? new Date(inv.created_at).toLocaleString() : 'Unknown'}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
      </div>
      <ChatSidebar
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onAsk={handleCopilotAsk}
        history={chatHistory}
        loading={loadingChat}
        invoice={activeInvoice}
      />
    </MainLayout>
  );
}
