import React, { useEffect, useState } from 'react';
import MainLayout from './components/MainLayout';
import Skeleton from './components/Skeleton';
import { motion } from 'framer-motion';
import ChatSidebar from './components/ChatSidebar';
import { API_BASE } from './api';

export default function Inbox() {
  const token = localStorage.getItem('token') || '';
  const tenant = localStorage.getItem('tenant') || 'default';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchInvoices = async () => {
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
  };

  useEffect(() => { fetchInvoices(); }, [token, tenant]);

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
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="px-2 py-1">#</th>
            <th className="px-2 py-1">Vendor</th>
            <th className="px-2 py-1">Amount</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="p-4"><Skeleton rows={5} height="h-4" /></td>
            </tr>
          ) : (
            invoices.map(inv => (
              <motion.tr
                key={inv.id}
                className="border-t hover:bg-gray-100"
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -100) archive(inv.id);
                }}
                whileDrag={{ scale: 1.02 }}
              >
                <td className="px-2 py-1">{inv.invoice_number}</td>
                <td className="px-2 py-1">{inv.vendor}</td>
                <td className="px-2 py-1">${inv.amount}</td>
                <td className="px-2 py-1 space-x-1">
                  <button onClick={() => approve(inv.id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                  <button onClick={() => reject(inv.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                  <button onClick={() => openCopilot(inv)} className="bg-indigo-600 text-white px-2 py-1 rounded text-xs">Chat</button>
                </td>
              </motion.tr>
            ))
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
