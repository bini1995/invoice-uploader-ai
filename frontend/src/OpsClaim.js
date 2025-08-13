import React, { useEffect, useState, useCallback, useMemo } from 'react';
import MainLayout from './components/MainLayout';
import Skeleton from './components/Skeleton';
import { motion } from 'framer-motion';
import ChatSidebar from './components/ChatSidebar';
import NotesModal from './components/NotesModal';
import PageHeader from './components/PageHeader';
import { API_BASE } from './api';
import {
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  LightBulbIcon,
  ClipboardIcon,
  ClockIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useSearchParams } from 'react-router-dom';

export default function OpsClaim() {
  const token = localStorage.getItem('token') || '';
  const tenant = localStorage.getItem('tenant') || 'default';
  const [searchParams] = useSearchParams();
  const initialFlagged = searchParams.get('flagged') === 'true';
  const initialStatus = searchParams.get('status') || 'Pending';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [activeClaim, setActiveClaim] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [assigneeList, setAssigneeList] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(initialFlagged);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState('newest');
  const [showPrioritized, setShowPrioritized] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesClaim, setNotesClaim] = useState(null);
  const [auditLogs, setAuditLogs] = useState({});

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchClaims = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${API_BASE}/api/${tenant}/claims?status=${encodeURIComponent(statusFilter)}`;
      if (from) url += `&from=${encodeURIComponent(from)}`;
      if (to) url += `&to=${encodeURIComponent(to)}`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setClaims(data);
        setVendorList([...new Set(data.map((i) => i.vendor).filter(Boolean))]);
        setAssigneeList([...new Set(data.map((i) => i.assignee).filter(Boolean))]);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('ClarifyClaims fetch error:', err);
    }
    setLoading(false);
  }, [token, tenant, headers, statusFilter, from, to]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);


  const archive = async (id) => {
    await fetch(`${API_BASE}/api/${tenant}/claims/${id}/archive`, {
      method: 'PATCH',
      headers,
    }).catch(() => {});
    fetchClaims();
  };

  const suggestAction = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/${tenant}/claims/${id}/think-suggestion`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (res.ok && data.suggestion) {
        alert(data.suggestion);
      }
    } catch (e) {
      console.error('Suggestion error', e);
    }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/${tenant}/claims/${id}/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ field: 'approval_status', value: status }),
    }).catch(() => {});
    fetchClaims();
  };

  const openCopilot = (inv) => {
    setActiveClaim(inv);
    setChatHistory([]);
    setCopilotOpen(true);
  };

  const handleCopilotAsk = async (question) => {
    if (!question.trim() || !activeClaim) return;
    try {
      setLoadingChat(true);
      const res = await fetch(`${API_BASE}/api/${tenant}/claims/${activeClaim.id}/copilot`, {
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

  const openNotes = (inv) => {
    setNotesClaim(inv);
    setNotesOpen(true);
  };

  const fetchAudit = async (id) => {
    if (auditLogs[id]) return;
    try {
      const res = await fetch(`${API_BASE}/api/audit?claimId=${id}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setAuditLogs((a) => ({ ...a, [id]: data }));
      }
    } catch (e) {
      console.error('Audit fetch error', e);
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
    await fetch(`${API_BASE}/api/${tenant}/claims/bulk/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ ids: selectedRows }),
    }).catch(() => {});
    setSelectedRows([]);
    fetchClaims();
  };

  const bulkReject = async () => {
    await fetch(`${API_BASE}/api/${tenant}/claims/bulk/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ ids: selectedRows }),
    }).catch(() => {});
    setSelectedRows([]);
    fetchClaims();
  };

  const bulkAssign = async () => {
    const assignee = prompt('Assign to who?');
    if (!assignee) return;
    await fetch(`${API_BASE}/api/${tenant}/claims/bulk/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ ids: selectedRows, assignee }),
    }).catch(() => {});
    setSelectedRows([]);
    fetchClaims();
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === sortedClaims.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedClaims.map((i) => i.id));
    }
  };

  const filteredClaims = claims
    .filter((inv) => !selectedVendor || inv.vendor === selectedVendor)
    .filter((inv) => !selectedAssignee || inv.assignee === selectedAssignee)
    .filter((inv) => !startDate || new Date(inv.date) >= new Date(startDate))
    .filter((inv) => !endDate || new Date(inv.date) <= new Date(endDate))
    .filter((inv) => (showFlaggedOnly ? inv.flagged : true));

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (showPrioritized) {
      const riskA = (a.flagged ? 2 : 0) + (a.risk_score ?? 0);
      const riskB = (b.flagged ? 2 : 0) + (b.risk_score ?? 0);
      return riskB - riskA;
    }
    if (sortBy === 'value') {
      return parseFloat(b.amount) - parseFloat(a.amount);
    }
    if (sortBy === 'risk') {
      const aRisk = a.risk_score ?? 0;
      const bRisk = b.risk_score ?? 0;
      return bRisk - aRisk;
    }
    return new Date(b.date) - new Date(a.date);
  });

  const statusBadge = (s) => {
    const base = 'px-2 py-1 rounded text-xs font-medium';
    if (s === 'Approved') return <span className={`${base} bg-green-100 text-green-800`}>Approved</span>;
    if (s === 'Needs Info' || s === 'Needs Review' || s === 'Pending')
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Needs Review</span>;
    if (s === 'Escalated') return <span className={`${base} bg-purple-100 text-purple-800`}>Escalated</span>;
    if (s === 'Flagged') return <span className={`${base} bg-red-100 text-red-800`}>Flagged</span>;
    if (s === 'Extracted') return <span className={`${base} bg-blue-100 text-blue-800`}>Extracted</span>;
    return <span className={`${base} bg-gray-100 text-gray-800`}>{s}</span>;
  };

  const focusMode = copilotOpen || expandedRows.length > 0 || selectedRows.length > 0;

  return (
    <MainLayout title="ClarifyOps › ClarifyClaims" helpTopic="opsclaim" collapseSidebar={focusMode}>
      <PageHeader title="ClarifyOps › ClarifyClaims" subtitle="Triage Queue" />
      {selectedRows.length > 0 && (
        <div className="mb-2 flex gap-2">
          <button onClick={bulkApprove} className="btn btn-ghost text-xs flex items-center gap-1">
            <CheckCircleIcon className="w-4 h-4" /> Approve All
          </button>
          <button onClick={bulkReject} className="btn btn-ghost text-xs flex items-center gap-1">
            <XCircleIcon className="w-4 h-4" /> Reject All
          </button>
          <button onClick={bulkAssign} className="btn btn-ghost text-xs flex items-center gap-1">
            <Cog6ToothIcon className="w-4 h-4" /> Assign
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Vendor</label>
          <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="input">
            <option value="">All</option>
            {vendorList.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Assignee</label>
          <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} className="input">
            <option value="">All</option>
            {assigneeList.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Start</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">End</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
        </div>
        <label className="text-xs flex items-center gap-1">
          <input type="checkbox" checked={showFlaggedOnly} onChange={() => setShowFlaggedOnly(!showFlaggedOnly)} />
          Show Flagged Only
        </label>
        <label className="text-xs flex items-center gap-1">
          <input type="checkbox" checked={showPrioritized} onChange={() => setShowPrioritized(!showPrioritized)} />
          🔮 Show AI-prioritized view
        </label>
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input">
            <option value="newest">Newest</option>
            <option value="value">Highest Value</option>
            <option value="risk">AI Risk Score</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center">
            <th className="px-3 py-4">
              <input type="checkbox" onChange={toggleSelectAll} checked={selectedRows.length === sortedClaims.length && sortedClaims.length > 0} />
            </th>
            <th className="px-3 py-4"></th>
            <th className="px-3 py-4">Claim #</th>
            <th className="px-3 py-4">Vendor</th>
            <th className="px-3 py-4">Uploaded</th>
            <th className="px-3 py-4">Amount</th>
            <th className="px-3 py-4">Status</th>
            <th className="px-3 py-4">Assignee</th>
            <th className="px-3 py-4">Tags</th>
            <th className="px-3 py-4">AI Insight</th>
            <th className="px-3 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="11" className="p-4"><Skeleton rows={5} height="h-4" /></td>
            </tr>
          ) : (
            sortedClaims.map((inv) => {
              const status = inv.flagged ? 'Flagged' : inv.approval_status || inv.status || 'Extracted';
              const borderColor =
                status === 'Approved'
                  ? 'border-green-500'
                  : status === 'Flagged' || status === 'Rejected'
                  ? 'border-red-500'
                  : 'border-yellow-500';
              return (
                <React.Fragment key={inv.id}>
                  <motion.tr
                    className={`border-t transition-shadow ${borderColor} border-l-4 odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200`}
                    drag="x"
                    dragConstraints={{ left: -120, right: 0 }}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -100) archive(inv.id);
                    }}
                    whileDrag={{ scale: 1.02 }}
                  >
                    <td className="px-3 py-4 text-center">
                      <input type="checkbox" checked={selectedRows.includes(inv.id)} onChange={() => toggleSelect(inv.id)} />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button onClick={() => toggleExpand(inv.id)}>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedRows.includes(inv.id) ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                    <td className="px-3 py-4">{inv.claim_number || inv.invoice_number}</td>
                    <td className="px-3 py-4">{inv.vendor}</td>
                    <td className="px-3 py-4">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-3 py-4">${inv.amount}</td>
                    <td className="px-3 py-4">{statusBadge(status)}</td>
                    <td className="px-3 py-4 text-center">
                      {inv.assignee ? (
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${inv.assignee}`} alt={inv.assignee} className="h-6 w-6 rounded-full mx-auto" />
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-xs">{Array.isArray(inv.tags) ? inv.tags.join(', ') : inv.tags || '-'}</td>
                    <td className="px-3 py-4 text-center">
                      {inv.ai_insight || inv.flag_reason ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {inv.ai_insight || inv.flag_reason}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-3 py-4 flex flex-col items-center gap-1 relative">
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateStatus(inv.id, 'Approved')}
                          className="btn btn-ghost p-1 text-xs flex items-center gap-1"
                        >
                          <CheckCircleIcon className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(inv.id, 'Needs Info')}
                          className="btn btn-ghost p-1 text-xs flex items-center gap-1"
                        >
                          <InformationCircleIcon className="w-4 h-4" /> Request Info
                        </button>
                        <button
                          onClick={() => updateStatus(inv.id, 'Escalated')}
                          className="btn btn-ghost p-1 text-xs flex items-center gap-1"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4" /> Escalate
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openNotes(inv)} className="btn btn-ghost p-1" title="Notes">
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                        <Tippy
                          content={
                            auditLogs[inv.id]
                              ? (
                                  <div className="text-left">
                                    {auditLogs[inv.id].map((l) => (
                                      <div key={l.id} className="text-xs">
                                        {new Date(l.created_at).toLocaleString()} - {l.action}
                                        {l.username ? ` (${l.username})` : ''}
                                      </div>
                                    ))}
                                  </div>
                                )
                              : 'Loading...'
                          }
                          interactive={true}
                          onShow={() => fetchAudit(inv.id)}
                        >
                          <button className="btn btn-ghost p-1" title="Audit Trail">
                            <ClockIcon className="w-4 h-4" />
                          </button>
                        </Tippy>
                        <button
                          onClick={() => openCopilot(inv)}
                          className="btn btn-ghost p-1 relative"
                          title="Chat"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          {Array.isArray(inv.comments) && inv.comments.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-4 w-4 text-[10px] flex items-center justify-center">{inv.comments.length}</span>
                          )}
                        </button>
                        <button
                          onClick={() => suggestAction(inv.id)}
                          className="btn btn-ghost p-1"
                          title="Suggest"
                        >
                          <LightBulbIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  {expandedRows.includes(inv.id) && (
                    <tr className="bg-gray-100">
                      <td></td>
                      <td colSpan="10" className="px-4 py-2 text-xs text-left">
                        PO#: {inv.po_number || inv.po_id || 'N/A'} | Tags: {Array.isArray(inv.tags) ? inv.tags.join(', ') : inv.tags || 'None'} | Uploaded:{' '}
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
        invoice={activeClaim}
      />
      <NotesModal
        open={notesOpen}
        invoice={notesClaim}
        onClose={() => setNotesOpen(false)}
      />
    </MainLayout>
  );
}
