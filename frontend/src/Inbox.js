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
} from '@heroicons/react/24/outline';

export default function Inbox() {
  const token = localStorage.getItem('token') || '';
  const tenant = localStorage.getItem('tenant') || 'default';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

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

  return (
    <MainLayout title="Inbox" helpTopic="inbox">
      <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center">
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
            <th className="px-2 py-2" title="Actions">
              <Cog6ToothIcon className="w-4 h-4 mx-auto" />
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="p-4"><Skeleton rows={5} height="h-4" /></td>
            </tr>
          ) : (
            invoices.map(inv => {
              const status = inv.flagged ? 'Flagged' : inv.approval_status || 'Pending';
              const borderColor =
                status === 'Approved'
                  ? 'border-green-500'
                  : status === 'Flagged' || status === 'Rejected'
                  ? 'border-red-500'
                  : 'border-yellow-500';
              return (
                <motion.tr
                  key={inv.id}
                  className={`border-t hover:bg-gray-50 hover:shadow-sm transition-shadow ${borderColor} border-l-4`}
                  drag="x"
                  dragConstraints={{ left: -120, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -100) archive(inv.id);
                  }}
                  whileDrag={{ scale: 1.02 }}
                >
                  <td className="px-3 py-2">{inv.invoice_number}</td>
                  <td className="px-3 py-2">{inv.vendor}</td>
                  <td className="px-3 py-2">${inv.amount}</td>
                  <td className="px-3 py-2 space-x-1 flex justify-center">
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
                      className="btn bg-indigo-600 hover:bg-indigo-700 text-white p-1"
                      title="Chat"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
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
