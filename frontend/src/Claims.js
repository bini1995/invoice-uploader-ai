/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_BASE } from './api';
import LiveFeed from './components/LiveFeed';
import Navbar from './components/Navbar';
import SidebarNav from './components/SidebarNav';
import PageHeader from './components/PageHeader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import Login from './Login';
import Spinner from './components/Spinner';
import DateRangeSlider from './components/ui/DateRangeSlider';
import Toast from './components/Toast';
import Skeleton from './components/Skeleton';
import EmptyState from './components/EmptyState';
import ChatSidebar from './components/ChatSidebar';
import GraphView from './components/GraphView';
import ConfirmModal from './components/ConfirmModal';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import TagEditor from './components/TagEditor';
import SuggestionChips from './components/SuggestionChips';
import PreviewModal from './components/PreviewModal';
import VendorProfilePanel from './components/VendorProfilePanel';
import BulkSummary from './components/BulkSummary';
import ActionToolbar from './components/ActionToolbar';
import AIAssistantPanel from './components/AIAssistantPanel';
import InvoiceSnapshotView from './components/InvoiceSnapshotView';
import SuccessAnimation from './components/SuccessAnimation';
import CTAButton from './components/ui/CTAButton';
import Joyride from 'react-joyride';
import ProgressBar from './components/ProgressBar';
import FeatureWidget from './components/FeatureWidget';
import ExplanationModal from './components/ExplanationModal';
import FlaggedBadge from './components/FlaggedBadge';
import CollaborativeCommentInput from './components/CollaborativeCommentInput';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { motion } from 'framer-motion';
import Fuse from 'fuse.js';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowUturnUpIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FlagIcon,
  LightBulbIcon,
  TagIcon,
  EyeIcon,
  TrashIcon,
  XCircleIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

const teamMembers = ['Alice', 'Bob', 'Charlie'];



function ClaimsPage() {
  const [visibleColumns, setVisibleColumns] = useState({
  id: true,
  invoice_number: true,
  date: true,
  amount: true,
  vendor: true,
  created_at: true,
  assignee: true,
  tags: true,
  actions: true,
  updated_at: true
});
const [files, setFile] = useState([]);   // file objects to submit
const [filePreviews, setFilePreviews] = useState([]);
const [fileErrors, setFileErrors] = useState([]);
const [dragActive, setDragActive] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [recentUploads, setRecentUploads] = useState([]);
const [uploadSuccess, setUploadSuccess] = useState(false);
const [previewModalData, setPreviewModalData] = useState(null);
const [bulkSummary, setBulkSummary] = useState(null);
const [showTour, setShowTour] = useState(() => !localStorage.getItem('seenTour'));
const tourSteps = [
  {
    target: '#uploadArea',
    content: 'Upload documents here',
  },
  {
    target: '#documentTable',
    content: 'Review uploaded documents',
  },
  {
    target: '#searchInput',
    content: 'Search documents',
  },
  {
    target: '#filterToggle',
    content: 'Toggle filter sidebar',
  },
];
const fileInputRef = useRef();
const searchInputRef = useRef();
  const [invoices, setInvoices] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [smartQuery, setSmartQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [token, setToken] = useState(localStorage.getItem('token') || '');
const [role, setRole] = useState(localStorage.getItem('role') || '');
const [loginError, setLoginError] = useState('');
const [vendorSummary, setVendorSummary] = useState('');
const [monthlyInsights, setMonthlyInsights] = useState(null);
const socket = useMemo(() => io(API_BASE), []);
const location = useLocation();
  const [vendorSuggestions, setVendorSuggestions] = useState({});
  const [suspicionFlags] = useState({});
  const [duplicateFlags, setDuplicateFlags] = useState({});
  const [showArchived, setShowArchived] = useState(false);
const [vendorList, setVendorList] = useState([]);
const [assigneeList, setAssigneeList] = useState([]);
const [selectedVendor, setSelectedVendor] = useState('');
const [selectedAssignee, setSelectedAssignee] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get('vendor');
    if (v) setSelectedVendor(v);
  }, [location.search]);
  const [tenant, setTenant] = useState(() => localStorage.getItem('tenant') || 'default');
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [cashFlowInterval, setCashFlowInterval] = useState('monthly');
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineInvoice, setTimelineInvoice] = useState(null);
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [snapshotInvoice, setSnapshotInvoice] = useState(null);
  const [topVendors, setTopVendors] = useState([]);
  const [tagReport, setTagReport] = useState([]);
  const [vendorPanelVendor, setVendorPanelVendor] = useState(null);
  const [filterType, setFilterType] = useState('none');
  const [filterTag, setFilterTag] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingField, setEditingField] = useState(null); // format: { id, field }
  const [editingValue, setEditingValue] = useState('');
  const [updatedFields, setUpdatedFields] = useState({});
  const [updatingField, setUpdatingField] = useState(null);
  const [tagSuggestions, setTagSuggestions] = useState({});
  const [tagColors, setTagColors] = useState({});
  const [qualityScores, setQualityScores] = useState({});
  const [riskScores, setRiskScores] = useState({});
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [featureOpen, setFeatureOpen] = useState(false);
  const [explainModal, setExplainModal] = useState(null); // { invoice, explanation, score }
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingAssistant, setLoadingAssistant] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('viewMode') || 'table';
  });

  const [downloadingId, setDownloadingId] = useState(null);
  const [paymentRequestId, setPaymentRequestId] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  // Offline mode disabled - always consider the app online
  const [isOffline] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );
  const [filterPresets, setFilterPresets] = useState(() => {
    const saved = localStorage.getItem('filterPresets');
    if (saved) return JSON.parse(saved);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .slice(0, 10);
    return [
      {
        name: 'Last Month',
        searchTerm: '',
        selectedVendor: '',
        selectedAssignee: '',
        minAmount: '',
        maxAmount: '',
        filterStartDate: start,
        filterEndDate: end,
        showArchived: false,
      },
      {
        name: 'Over $500',
        searchTerm: '',
        selectedVendor: '',
        selectedAssignee: '',
        minAmount: '500',
        maxAmount: '',
        filterStartDate: '',
        filterEndDate: '',
        showArchived: false,
      },
      {
        name: 'Unassigned',
        searchTerm: '',
        selectedVendor: '',
        selectedAssignee: 'unassigned',
        minAmount: '',
        maxAmount: '',
        filterStartDate: '',
        filterEndDate: '',
        showArchived: false,
      },
    ];
  });
  const [selectedPreset, setSelectedPreset] = useState('');
  const [presetName, setPresetName] = useState('');

  const activeFilters = useMemo(() => {
    const filters = [];
    if (searchTerm) filters.push(`Search: ${searchTerm}`);
    if (smartQuery) filters.push(`NL: ${smartQuery}`);
    if (selectedVendor) filters.push(`Vendor: ${selectedVendor}`);
    if (selectedAssignee)
      filters.push(
        `Assignee: ${selectedAssignee === 'unassigned' ? 'Unassigned' : selectedAssignee}`
      );
    if (minAmount) filters.push(`Min: ${minAmount}`);
    if (maxAmount) filters.push(`Max: ${maxAmount}`);
    if (filterStartDate) filters.push(`From: ${filterStartDate}`);
    if (filterEndDate) filters.push(`To: ${filterEndDate}`);
    if (showArchived) filters.push('Archived');
    return filters;
  }, [searchTerm, smartQuery, selectedVendor, selectedAssignee, minAmount, maxAmount, filterStartDate, filterEndDate, showArchived]);


  const addToast = useCallback(
    (
      text,
      type = 'success',
      options = { duration: 3000, actionText: null, onAction: null }
    ) => {
      const id = Date.now();
      const toast = {
        id,
        text,
        type,
      actionText: options.actionText,
      onAction: options.onAction,
    };
    setToasts((t) => [...t, toast]);
    const timeout = setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, options.duration);

      return () => clearTimeout(timeout);
    },
    []
  );

  const addNotification = (text) => {
    const n = { id: Date.now(), text, read: false };
    setNotifications((prev) => [n, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const markNotificationsRead = () => {
    const headers = { Authorization: `Bearer ${token}` };
    notifications
      .filter((n) => !n.read && n.id)
      .forEach((n) => {
        fetch(`${API_BASE}/api/notifications/${n.id}/read`, {
          method: 'PATCH',
          headers,
        }).catch(() => {});
      });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationsOpen = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, { headers });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (err) {
      console.error('Notifications fetch error:', err);
    }
    markNotificationsRead();
  };

  const fetchInvoices = useCallback(
    async (includeArchived = false, assigneeFilter = '') => {
      try {
        setLoadingInvoices(true);
        const params = [];
        if (includeArchived) params.push('includeArchived=true');
        if (assigneeFilter) params.push(`assignee=${encodeURIComponent(assigneeFilter)}`);
        const query = params.length ? `?${params.join('&')}` : '';
        const url = `http://localhost:3000/api/invoices${query}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          throw new Error(`HTTP ${res.status}`);
        }
        setInvoices(data);
        data.forEach((inv) => socket.emit('joinInvoice', inv.id));
        localStorage.setItem('cachedInvoices', JSON.stringify(data));
        const vendors = Array.from(new Set(data.map((inv) => inv.vendor).filter(Boolean)));
        setVendorList(vendors);
        const assignees = Array.from(new Set(data.map((inv) => inv.assignee).filter(Boolean)));
        setAssigneeList(Array.from(new Set([...teamMembers, ...assignees])));

        const uniqueTags = Array.from(new Set(data.flatMap((inv) => inv.tags || [])));
        if (uniqueTags.length) {
          try {
            const colorRes = await fetch('http://localhost:3000/api/invoices/suggest-tag-colors', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ tags: uniqueTags }),
            });
            if (colorRes.ok) {
              const colorData = await colorRes.json();
              if (colorData.colors) {
                setTagColors(colorData.colors);
              }
            }
          } catch (e) {
            console.error('Tag color fetch failed:', e);
          }
        }

        const groups = {};
        data.forEach((inv) => {
          const key = `${inv.vendor}|${new Date(inv.date).toISOString().slice(0, 10)}|${inv.amount}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(inv.id);
        });
        const dupMap = {};
        Object.values(groups).forEach((list) => {
          if (list.length > 1) list.forEach((id) => {
            dupMap[id] = true;
          });
        });
        setDuplicateFlags(dupMap);

        if (Object.keys(dupMap).length > 0) {
          addToast('⚠️ Duplicate documents detected', 'error');
        }

        return data;
      } catch (err) {
        console.error('Fetch error:', err);
        addToast('Failed to fetch documents', 'error');
        const cached = localStorage.getItem('cachedInvoices');
        if (cached) {
          setInvoices(JSON.parse(cached));
          setMessage('Showing cached documents');
        } else {
          setMessage('❌ Could not load documents');
        }
      } finally {
        setLoadingInvoices(false);
      }
  }, [token, socket, addToast]);

  const handleArchive = useCallback(
    (id) => {
      setConfirmData({
        message: `Are you sure you want to archive document #${id}?`,
        onConfirm: async () => {
          try {
            const res = await fetch(`http://localhost:3000/api/invoices/${id}/archive`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const data = await res.json();
            addToast(`📦 ${data.message}`);

            const updated = await fetch('http://localhost:3000/api/invoices');
            const updatedData = await updated.json();
            setInvoices(updatedData);
          } catch (err) {
            console.error('Archive error:', err);
            addToast('⚠️ Failed to archive document.', 'error');
          }
        },
      });
  }, [token, addToast]);

  const handleUnarchive = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/unarchive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      addToast(`✅ ${data.message}`);

      if (showArchived) {
        fetchInvoices(showArchived, selectedAssignee);
      }
    } catch (err) {
      console.error('Unarchive error:', err);
      addToast('❌ Failed to unarchive document', 'error');
    }
  };

  const handleFlagSuspicious = useCallback(async (invoice) => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/flag-suspicious', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoice }),
      });

      const data = await res.json();

      if (res.ok && data.insights) {
        addToast(`🚩 Suspicion Insight: ${data.insights}`);
      } else {
        addToast(`🚩 ${data.message || 'No insights returned.'}`);
      }
    } catch (err) {
      console.error('🚩 Flagging failed:', err);
      addToast('🚩 ⚠️ Failed to flag document.', 'error');
    }
  }, [token, addToast]);

  // Offline sync disabled
  const syncPendingActions = useCallback(async () => {}, []);

  const handleBulkArchive = useCallback(() => {
    if (!selectedInvoices.length) return;
    setConfirmData({
      message: `Archive ${selectedInvoices.length} selected documents?`,
      onConfirm: () => {
        selectedInvoices.forEach((id) => handleArchive(id));
        setSelectedInvoices([]);
      },
    });
  }, [selectedInvoices, handleArchive]);


  
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('tenant', tenant);
  }, [tenant]);


  useEffect(() => {
    const addTitles = () => {
      document.querySelectorAll('button').forEach((btn) => {
        if (!btn.getAttribute('title') && btn.textContent.trim()) {
          btn.setAttribute('title', btn.textContent.trim());
        }
      });
    };
    addTitles();
    const observer = new MutationObserver(addTitles);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const orig = window.fetch;
    window.fetch = async (url, options = {}) => {
      if (typeof url === 'string') {
        if (url.startsWith('http://localhost:3000')) {
          url = url.replace('http://localhost:3000', API_BASE);
        }
        if (url.startsWith(API_BASE)) {
          let path = url.slice(API_BASE.length);
          if (path.startsWith('/api/invoices')) {
            path = path.replace('/api/invoices', '/api/claims');
          } else if (path.startsWith('/api/export-templates')) {
            path = path.replace('/api/export-templates', `/api/${tenant}/export-templates`);
          }
          url = API_BASE + path;
        } else if (url.startsWith('/')) {
          if (url.startsWith('/api/invoices')) {
            url = url.replace('/api/invoices', '/api/claims');
          } else if (url.startsWith('/api/export-templates')) {
            url = url.replace('/api/export-templates', `/api/${tenant}/export-templates`);
          }
          url = `${API_BASE}${url}`;
        }
      }
      const headers = { 'X-Tenant-Id': tenant, ...(options.headers || {}) };
      if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
      }
      try {
        return await orig(url, { ...options, headers });
      } catch (err) {
        throw err;
      }
    };
    return () => {
      window.fetch = orig;
    };
  }, [tenant, token, syncPendingActions, addToast]);

  // Offline sync disabled


  


  const fuse = useMemo(
    () =>
      new Fuse(invoices, {
        keys: ['invoice_number', 'vendor', 'description', 'tags', 'id'],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [invoices]
  );

  const searchResults = searchTerm ? fuse.search(searchTerm).map((r) => r.item) : invoices;

  const filteredInvoices = searchResults
  .filter((inv) => !selectedVendor || inv.vendor === selectedVendor)
  .filter((inv) =>
    !selectedAssignee
      ? true
      : selectedAssignee === 'unassigned'
      ? !inv.assignee
      : inv.assignee === selectedAssignee
  )
  .filter((inv) => {
    const amount = parseFloat(inv.amount);
    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);

    if (isNaN(amount)) return false;
    if (minAmount && amount < min) return false;
    if (maxAmount && amount > max) return false;

    if (filterStartDate && new Date(inv.date) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(inv.date) > new Date(filterEndDate)) return false;

    return true;
  });




  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    if (sortedInvoices.length > 0) {
      setHighlightIndex(0);
    } else {
      setHighlightIndex(-1);
    }
  }, [sortedInvoices.length]);


  const allSelected = selectedInvoices.length === sortedInvoices.length && sortedInvoices.length > 0;

  useEffect(() => {
    const handleKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'a' || e.key === 'A') {
        if (selectedInvoices.length) handleBulkArchive();
      }
      if (e.key === 'f' || e.key === 'F') {
        if (selectedInvoices.length) {
          selectedInvoices.forEach((id) => {
            const inv = invoices.find((i) => i.id === id);
            if (inv) handleFlagSuspicious(inv);
          });
        }
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(sortedInvoices.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === 'Enter') {
        if (highlightIndex >= 0 && highlightIndex < sortedInvoices.length) {
          setSnapshotInvoice(sortedInvoices[highlightIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedInvoices, invoices, handleBulkArchive, handleFlagSuspicious, sortedInvoices, highlightIndex]);


  const toggleSelectInvoice = (id) => {
    setSelectedInvoices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedInvoices([]);
    } else {
      const visibleIds = sortedInvoices.map((inv) => inv.id);
      setSelectedInvoices(visibleIds);
    }
  };
const handleBulkDelete = () => {
    if (!selectedInvoices.length) return;
    setConfirmData({
      message: `Delete ${selectedInvoices.length} selected documents?`,
      onConfirm: () => {
        selectedInvoices.forEach((id) => handleDelete(id));
        setSelectedInvoices([]);
      },
    });
  };
  
  const handleBulkUnarchive = () => {
    selectedInvoices.forEach((id) => handleUnarchive(id));
    setSelectedInvoices([]);
  };
  
  const handleUpdateInvoice = async (id, field, value) => {
    if (!value) {
      addToast('Field cannot be empty', 'error');
      return;
    }
    if (field === 'amount' && isNaN(parseFloat(value))) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    try {
      setUpdatingField(`${id}-${field}`);
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ field, value }),
      });
  
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        const updatedList = await fetchInvoices(showArchived, selectedAssignee); // refresh and get new data

        if (field === 'vendor') {
          const updatedInv = updatedList?.find((inv) => inv.id === id);
          if (updatedInv) handleSuggestTags(updatedInv);
        }
  
        // ✅ ✅ Add this to show a green checkmark after update
        setUpdatedFields((prev) => ({
          ...prev,
          [`${id}-${field}`]: true,
        }));
  
        setTimeout(() => {
          setUpdatedFields((prev) => {
            const updated = { ...prev };
            delete updated[`${id}-${field}`];
            return updated;
          });
        }, 3000); // ✅ Hide checkmark after 3 seconds
      } else {
        addToast('❌ Failed to update document', 'error');
      }
    } catch (err) {
      console.error('Inline update error:', err);
      addToast('⚠️ Something went wrong.', 'error');
    }
    finally {
      setUpdatingField(null); // 👈 done updating
    }
  };

  const handleAssign = async (id, assignee) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignee }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        addNotification(`New document assigned to ${assignee}`);
        setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, assignee } : inv)));
      } else {
        addToast('❌ Failed to assign document', 'error');
      }
    } catch (err) {
      console.error('Assign error:', err);
      addToast('⚠️ Failed to assign document', 'error');
    }
  };
  
  

  const [entityTotals, setEntityTotals] = useState([]);
  const vendorTotals = invoices.reduce((acc, inv) => {
    if (!inv.vendor || !inv.amount) return acc;
    const vendor = inv.vendor;
    const amount = parseFloat(inv.amount);
    acc[vendor] = (acc[vendor] || 0) + amount;
    return acc;
  }, {});

  const chartData =
    entityTotals.length > 0
      ? entityTotals
      : Object.entries(vendorTotals).map(([entity, total]) => ({ entity, total }));
  

  const itemsPerPage = 10;

useEffect(() => {
  if (navigator.onLine) {
    fetchInvoices(showArchived, selectedAssignee);
  } else {
    const cached = localStorage.getItem('cachedInvoices');
    if (cached) {
      setInvoices(JSON.parse(cached));
    }
  }
}, [showArchived, selectedAssignee, fetchInvoices]);

  

  useEffect(() => {
    const vendors = [...new Set(invoices.map(inv => inv.vendor))];
    setVendorList(vendors);
  }, [invoices]);

  useEffect(() => {
    socket.on('chatMessage', (m) => {
      setInvoices((prev) => prev.map((inv) =>
        inv.id === m.invoiceId
          ? { ...inv, comments: [...(inv.comments || []), { text: m.text, user: m.user, date: m.date }] }
          : inv
      ));
    });
    return () => socket.off('chatMessage');
  }, [socket]);

  useEffect(() => {
    socket.on('notification', (n) => {
      if (n && n.text) addNotification(n.text);
    });
    return () => socket.off('notification');
  }, [socket]);
  
  

  const handleFiles = async (fileList) => {
    const arr = Array.from(fileList);
    const previews = [];
    const errors = [];

    for (const f of arr) {
      let rows = 'N/A';
      let preview = null;
      const lower = f.name.toLowerCase();
      const ext = lower.substring(lower.lastIndexOf('.'));

      if (ext === '.csv') {
        const text = await f.text();
        const lines = text.trim().split(/\r?\n/);
        rows = Math.max(lines.length - 1, 0);
        const headers = lines[0].split(',');
        const previewLines = lines.slice(1, 6).map((l) => l.split(','));
        preview = [headers, ...previewLines];
        const normalized = headers.map((h) => h.trim().toLowerCase());
        const required = ['invoice_number', 'date', 'amount', 'vendor'];
        const missing = required.filter((h) => !normalized.includes(h));
        if (missing.length) {
          errors.push(`${f.name} missing: ${missing.join(', ')}`);
        }
      } else if (ext === '.pdf') {
        // handled server-side; rows remain N/A
      } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        // image uploads use OCR on the backend
      } else {
        errors.push(`${f.name} is not a CSV, PDF or image file`);
      }

      previews.push({ file: f, name: f.name, size: f.size, rows, preview });
    }

    setFile(arr);
    setFilePreviews(previews);
    setFileErrors(errors);
    if (errors.length) {
      addToast('Some files were invalid', 'error');
    }
  };

  const openUploadPreview = () => {
    if (filePreviews.length > 0) {
      setPreviewModalData({ ...filePreviews[0], confirm: true });
    } else {
      addToast('Please select one or more files', 'error');
    }
  };

  const handleUpload = async () => {
    if (!files.length) return addToast('Please select one or more files', 'error');

    setPreviewModalData(null);

    setLoading(true);
    setUploadProgress(0);
    let hadError = false;

    for (const [idx, file] of files.entries()) {
      const formData = new FormData();
      formData.append('invoiceFile', file);

      try {
        const res = await fetch('http://localhost:3000/api/invoices/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        
        const data = await res.json();

        if (res.ok) {
          setRecentUploads(prev => [{ name: file.name, time: new Date().toLocaleString() }, ...prev].slice(0, 5));
          setMessage((prev) => prev + `\n✅ ${data.inserted} invoice(s) submitted from ${file.name}`);
          addToast(`✅ Submitted ${data.inserted} invoice(s) from ${file.name}`);
        } else {
          hadError = true;
          if (res.status === 401 || data.message === 'Invalid token') {
            localStorage.removeItem('token');
            addToast('Session expired. Please log in again.', 'error');
            return navigate('/login');
          }
          addToast(data.message || 'Upload failed', 'error');
          continue;
        }
        if (data.errors?.length) {
          hadError = true;
          setMessage((prev) => prev + `\n❌ ${data.errors.length} row(s) had issues in ${file.name}`);
          setErrors((prev) => [...prev, ...data.errors]);
  
          try {
            const aiRes = await fetch('http://localhost:3000/api/invoices/summarize-errors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ errors: data.errors }),
            });
            const aiData = await aiRes.json();
            setAiSummary((prev) => prev + `\n${aiData.summary}`);

            // After setting AI summary
            await fetch('http://localhost:3000/api/invoices/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // if your email endpoint is protected
              },
              body: JSON.stringify({
                aiSummary: aiData.summary,
                invoices: filteredInvoices,
              }),
            });

          } catch (err) {
            console.error('AI summary error:', err);
            setAiSummary('⚠️ Failed to summarize some errors');
          }
        }
      } catch (err) {
        console.error(`Submission failed for ${file.name}:`, err);
        setMessage((prev) => prev + `\n❌ Submission failed for ${file.name}`);
        hadError = true;
      }

      setUploadProgress(Math.round(((idx + 1) / files.length) * 100));
    }

    addToast('📧 Email sent with summary and invoice list!');
    addToast(hadError ? '❌ Error processing file' : '✅ Upload complete', hadError ? 'error' : 'success');
  
    const updated = await fetch('http://localhost:3000/api/invoices');
    const updatedData = await updated.json();
    setInvoices(updatedData);
    const newIds = updatedData
      .filter(inv => !invoices.some(existing => existing.id === inv.id))
      .map(inv => inv.id);

    if (newIds.length > 0) {
      const newInvs = updatedData.filter(inv => newIds.includes(inv.id));
      const valid = newInvs.length;
      const flagged = newInvs.filter(inv => inv.flagged).length;
      const total = newInvs.reduce((s, inv) => s + parseFloat(inv.amount || 0), 0);
      const vendorTotals = {};
      newInvs.forEach(inv => {
        vendorTotals[inv.vendor] = (vendorTotals[inv.vendor] || 0) + parseFloat(inv.amount || 0);
      });
      const topVendors = Object.entries(vendorTotals).sort((a,b)=>b[1]-a[1]).slice(0,3).map(v=>v[0]);
      const tags = Array.from(new Set(newInvs.flatMap(inv => inv.tags || [])));
      setBulkSummary({ valid, flagged, total, topVendors, tags });
    }

    // automatically fetch tag suggestions for newly uploaded invoices
    newIds.forEach((newId) => {
      const inv = updatedData.find(i => i.id === newId);
      if (inv) handleSuggestTags(inv);
    });

    if (newIds.length > 0) {
      setRecentInvoices(newIds);
      setTimeout(() => {
        setRecentInvoices([]);
      }, 5000); // Clear after 5 seconds
    }
    setLoading(false);
    setFile([]);
    setFilePreviews([]);
    if (!hadError) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    }
  };
  
  const handleExport = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoices: filteredInvoices }),
      });
      

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'filtered_invoices.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export filtered failed:', err);
    }
  };

  const handleVendorSummary = async () => {
    try {
      setLoadingVendor(true);
      const vendorData = {};
      invoices.forEach((inv) => {
        if (!vendorData[inv.vendor]) vendorData[inv.vendor] = 0;
        vendorData[inv.vendor] += parseFloat(inv.amount || 0);
      });
  
      const res = await fetch('http://localhost:3000/api/invoices/summarize-vendor-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorData }),
      });
  
      const data = await res.json();
      setVendorSummary(data.summary || '⚠️ No insight generated');
    } catch (err) {
      console.error('Vendor summary error:', err);
      setVendorSummary('⚠️ Failed to summarize vendor trends.');
    } 
    finally {
      setLoadingVendor(false);
    }
  };



  const handleConversationalUpload = async (text) => {
    if (!text.trim()) return;
    try {
      setLoadingAssistant(true);
      const res = await fetch('http://localhost:3000/api/invoices/nl-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Invoice created');
        fetchInvoices(showArchived, selectedAssignee);
      } else {
        addToast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      console.error('Conversational upload error:', err);
      addToast('Upload failed', 'error');
    } finally {
      setLoadingAssistant(false);
    }
  };

  const handleSummarizeErrors = async () => {
    if (!errors.length) return;
    setSummaryLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/invoices/summarize-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiSummary(data.summary);
        addToast('✅ Errors summarized');
      } else {
        addToast('⚠️ Failed to summarize errors', 'error');
      }
    } catch (err) {
      console.error('Summarize errors failed:', err);
      addToast('⚠️ Failed to summarize errors', 'error');
    }
    finally {
      setSummaryLoading(false);
    }
  };

  const handleMonthlyInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await fetch('http://localhost:3000/api/invoices/monthly-insights', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMonthlyInsights(data);
      } else {
        addToast('Failed to fetch monthly insights', 'error');
      }
    } catch (err) {
      console.error('Monthly insights error:', err);
      addToast('Failed to fetch monthly insights', 'error');
    } finally {
      setLoadingInsights(false);
    }
  };

  const fetchCashFlowData = useCallback(async (interval = cashFlowInterval) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/cash-flow?interval=${interval}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCashFlowData(data.data || []);
      } else {
        addToast('Failed to fetch cash flow', 'error');
      }
    } catch (err) {
      console.error('Cash flow fetch error:', err);
      addToast('Failed to fetch cash flow', 'error');
    }
  }, [token, cashFlowInterval, addToast]);

  const fetchTopVendors = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType === 'tag' && filterTag) params.append('tag', filterTag);
      if (filterType === 'date') {
        if (filterStartDate) params.append('startDate', filterStartDate);
        if (filterEndDate) params.append('endDate', filterEndDate);
      }
      if (filterType === 'amount') {
        if (filterMinAmount) params.append('minAmount', filterMinAmount);
        if (filterMaxAmount) params.append('maxAmount', filterMaxAmount);
      }
      const res = await fetch(`http://localhost:3000/api/invoices/totals-by-entity?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTopVendors(
          (data.entityTotals || []).map((e) => ({ entity: e.entity, total: e.total }))
        );
      } else {
        addToast('Failed to fetch entity totals', 'error');
      }
    } catch (err) {
      console.error('Top vendors fetch error:', err);
      addToast('Failed to fetch top vendors', 'error');
    }
  }, [token, filterType, filterTag, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, addToast]);

  const fetchEntityTotals = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/invoices/totals-by-entity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.entityTotals)) {
        setEntityTotals(data.entityTotals);
      }
    } catch (err) {
      console.error('Entity totals fetch error:', err);
    }
  }, [token]);

  const fetchTagReport = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType === 'date') {
        if (filterStartDate) params.append('startDate', filterStartDate);
        if (filterEndDate) params.append('endDate', filterEndDate);
      }
      if (filterType === 'amount') {
        if (filterMinAmount) params.append('minAmount', filterMinAmount);
        if (filterMaxAmount) params.append('maxAmount', filterMaxAmount);
      }
      const res = await fetch(`http://localhost:3000/api/invoices/spending-by-tag?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTagReport(data.byTag || []);
      } else {
        addToast('Failed to fetch tag report', 'error');
      }
    } catch (err) {
      console.error('Tag report fetch error:', err);
      addToast('Failed to fetch tag report', 'error');
    }
  }, [token, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, addToast]);

  useEffect(() => {
    if (showChart && token) {
      setLoadingCharts(true);
      Promise.all([
        fetchCashFlowData(cashFlowInterval),
        fetchTopVendors(),
        fetchTagReport(),
        fetchEntityTotals(),
      ]).finally(() => setLoadingCharts(false));
    }
  }, [showChart, cashFlowInterval, token, filterType, filterTag, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, fetchCashFlowData, fetchTopVendors, fetchTagReport, fetchEntityTotals]);


  const handleExportAll = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/export-all', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_invoices.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export all failed:', err);
    }
  };

  const handleExportDashboardPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType === 'tag' && filterTag) params.append('tag', filterTag);
      if (filterType === 'date') {
        if (filterStartDate) params.append('startDate', filterStartDate);
        if (filterEndDate) params.append('endDate', filterEndDate);
      }
      if (filterType === 'amount') {
        if (filterMinAmount) params.append('minAmount', filterMinAmount);
        if (filterMaxAmount) params.append('maxAmount', filterMaxAmount);
      }
      const res = await fetch(`http://localhost:3000/api/invoices/dashboard/pdf?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Dashboard PDF export failed:', err);
      addToast('Failed to export dashboard', 'error');
    }
  };

  const handleAssistantQuery = async (question) => {
    if (!question.trim()) return;
    try {
      setLoadingAssistant(true);
      const res = await fetch('http://localhost:3000/api/invoices/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory((h) => [...h, { type: 'chat', question, answer: data.answer }]);
        addToast('✅ Response ready');
      } else {
        addToast(data.message || 'Error', 'error');
        setChatHistory((h) => [...h, { type: 'chat', question, answer: data.message || 'Error' }]);
      }
    } catch (err) {
      console.error('Assistant query failed:', err);
      addToast('Failed to get answer', 'error');
      setChatHistory((h) => [...h, { type: 'chat', question, answer: 'Failed to get answer.' }]);
    } finally {
      setLoadingAssistant(false);
    }
  };

  const handleBillingQuery = async (question) => {
    if (!question.trim()) return;
    try {
      setLoadingAssistant(true);
      const res = await fetch('http://localhost:3000/api/invoices/billing-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory((h) => [...h, { type: 'chat', question, answer: JSON.stringify(data.rows) }]);
        addToast('✅ Billing results ready');
      } else {
        addToast(data.message || 'Error', 'error');
        setChatHistory((h) => [...h, { type: 'chat', question, answer: data.message || 'Error' }]);
      }
    } catch (err) {
      console.error('Billing query failed:', err);
      addToast('Failed to get answer', 'error');
      setChatHistory((h) => [...h, { type: 'chat', question, answer: 'Failed to get answer.' }]);
    } finally {
      setLoadingAssistant(false);
    }
  };

  const handleChartQuery = async (question) => {
    if (!question.trim()) return;
    try {
      setLoadingAssistant(true);
      const res = await fetch('http://localhost:3000/api/invoices/nl-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory((h) => [...h, { type: 'chart', question, chartData: data.rows }]);
        addToast('✅ Chart ready');
      } else {
        addToast(data.message, 'error');
        setChatHistory((h) => [...h, { type: 'chart', question, chartData: [] }]);
      }
    } catch (err) {
      console.error('Chart query failed:', err);
      addToast('Failed to run query', 'error');
      setChatHistory((h) => [...h, { type: 'chart', question, chartData: [] }]);
    } finally {
      setLoadingAssistant(false);
    }
  };

  const handleSummary = () => addToast('Summary builder coming soon');
  const handlePattern = () => addToast('Pattern recognition coming soon');
  const handleCategorize = () => addToast('Automated categorization coming soon');
  const handleTagging = () => addToast('Smart tagging & routing coming soon');
  

  const handleDelete = (id) => {
    const proceed = async () => {
      const invoice = invoices.find((inv) => inv.id === id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));

      const undo = () => {
        clearTimeout(timeout);
        setInvoices((prev) => [invoice, ...prev].sort((a, b) => b.id - a.id));
      };

      const timeout = setTimeout(async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/invoices/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          addToast(data.message);

          const updated = await fetch('http://localhost:3000/api/invoices');
          const updatedData = await updated.json();
          setInvoices(updatedData);
        } catch (err) {
          console.error('Delete error:', err);
          addToast('Failed to delete document.', 'error');
        }
      }, 5000);

      addToast(`Claim Document #${id} deleted`, 'success', {
        duration: 5000,
        actionText: 'Undo',
        onAction: undo,
      });
    };

    setConfirmData({
      message: `Are you sure you want to delete document #${id}?`,
      onConfirm: proceed,
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError('Username and password are required');
      addToast('Please enter username and password', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/claims/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setLoginError('');
        addToast('Logged in!');
      } else {
        setLoginError('Invalid credentials');
        addToast('Invalid credentials', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Login failed');
      addToast('Login failed', 'error');
    }
  };
  
  const handleClearAll = () => {
    setConfirmData({
      message: '⚠️ Are you sure you want to delete all documents?',
      onConfirm: async () => {
        try {
          const res = await fetch('http://localhost:3000/api/invoices/clear', {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          addToast(data.message);

          // Refresh the invoice list
          const updated = await fetch('http://localhost:3000/api/invoices');
          const updatedData = await updated.json();
          setInvoices(updatedData);
        } catch (err) {
          console.error('Clear all failed:', err);
          addToast('❌ Failed to clear documents.', 'error');
        }
      },
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSmartQuery('');
    setSelectedVendor('');
    setSelectedAssignee('');
    setMinAmount('');
    setMaxAmount('');
    setFilterStartDate('');
    setFilterEndDate('');
    setShowArchived(false);
  };

  const handleSavePreset = () => {
    const preset = {
      name: presetName || `Preset ${filterPresets.length + 1}`,
      searchTerm,
      selectedVendor,
      selectedAssignee,
      minAmount,
      maxAmount,
      filterStartDate,
      filterEndDate,
      showArchived,
    };
    const updated = [
      ...filterPresets.filter((p) => p.name !== preset.name),
      preset,
    ];
    setFilterPresets(updated);
    localStorage.setItem('filterPresets', JSON.stringify(updated));
    setPresetName('');
  };

  const handleApplyPreset = (name) => {
    const preset = filterPresets.find((p) => p.name === name);
    if (preset) {
      setSearchTerm(preset.searchTerm);
      setSelectedVendor(preset.selectedVendor);
      setSelectedAssignee(preset.selectedAssignee);
      setMinAmount(preset.minAmount);
      setMaxAmount(preset.maxAmount);
      setFilterStartDate(preset.filterStartDate || '');
      setFilterEndDate(preset.filterEndDate || '');
      setShowArchived(preset.showArchived);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast('📋 Copied to clipboard!');
  };

  const handleSmartSearch = async () => {
    if (!smartQuery) return;
    try {
      const res = await fetch('http://localhost:3000/api/invoices/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: smartQuery }),
      });
      const data = await res.json();
      if (res.ok && data.filters) {
        setSelectedVendor(data.filters.vendor || '');
        setMinAmount(data.filters.minAmount ? String(data.filters.minAmount) : '');
        setMaxAmount(data.filters.maxAmount ? String(data.filters.maxAmount) : '');
        setFilterStartDate(data.filters.startDate || '');
        setFilterEndDate(data.filters.endDate || '');
        setSearchTerm('');
      } else {
        addToast(data.message || 'Failed to parse query', 'error');
      }
    } catch (err) {
      console.error('Smart search failed:', err);
      addToast('Failed to parse query', 'error');
    }
  };
  
  

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  const handleSuggestVendor = async (invoice) => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/suggest-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoice_number: invoice.invoice_number,
          amount: invoice.amount,
        }),
      });
  
      const data = await res.json();
      setVendorSuggestions((prev) => ({
        ...prev,
        [invoice.id]: data.suggestion || 'No suggestion available.',
      }));
    } catch (err) {
      console.error('Vendor suggestion failed:', err);
      setVendorSuggestions((prev) => ({
        ...prev,
        [invoice.id]: '⚠️ Failed to get suggestion.',
      }));
    }
  };
  

  const handleViewTimeline = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTimelineInvoice(id);
      if (Array.isArray(data)) setTimeline(data);
      else if (Array.isArray(data.timeline)) setTimeline(data.timeline);
      else setTimeline([]);
      setShowTimeline(true);
    } catch (err) {
      console.error('Timeline fetch failed:', err);
      addToast('Failed to load timeline', 'error');
    }
  };

  const openInvoiceDetails = (inv) => {
    setDetailInvoice(inv);
  };

  const handleQualityScore = async (invoice) => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/quality-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice }),
      });
      const data = await res.json();
      if (res.ok) {
        setQualityScores((p) => ({ ...p, [invoice.id]: data }));
      } else {
        setQualityScores((p) => ({ ...p, [invoice.id]: { score: 'N/A', tips: data.message } }));
      }
    } catch (err) {
      console.error('Quality score error:', err);
      setQualityScores((p) => ({ ...p, [invoice.id]: { score: 'N/A', tips: 'Failed to score.' } }));
    }
  };

  const handleRiskScore = async (invoice) => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/payment-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendor: invoice.vendor }),
      });
      const data = await res.json();
      if (res.ok) {
        setRiskScores((p) => ({ ...p, [invoice.id]: data.risk }));
      } else {
        setRiskScores((p) => ({ ...p, [invoice.id]: 'N/A' }));
      }
    } catch (err) {
      console.error('Risk score error:', err);
      setRiskScores((p) => ({ ...p, [invoice.id]: 'N/A' }));
    }
  };

  const handleExplainInvoice = async (invoice) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${invoice.id}/explain`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setExplainModal({ invoice, explanation: data.explanation, score: data.anomaly_score });
      } else {
        addToast(data.message || 'Failed to explain document', 'error');
      }
    } catch (err) {
      console.error('Explain invoice error:', err);
      addToast('Failed to explain document', 'error');
    }
  };
  

  const handleSuggestTags = async (invoice) => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/suggest-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoice }),
      });
  
      const data = await res.json();
      if (res.ok && data.tags) {
        setTagSuggestions((prev) => ({
          ...prev,
          [invoice.id]: data.tags,
        }));
        addNotification('Auto-tagging complete.');
      } else {
        addToast('⚠️ No tags returned', 'error');
      }
    } catch (err) {
      console.error('Tag suggestion failed:', err);
      addToast('⚠️ Failed to get tag suggestions', 'error');
    }
  };
  

  
  const handleDownloadPDF = async (id) => {
    setDownloadingId(id);

    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed:', err);
      addToast('⚠️ Failed to download document PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePaymentRequest = async (id) => {
    setPaymentRequestId(id);
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/payment-request`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Request failed');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-request-${id}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Payment request error:', err);
      addToast('⚠️ Failed to fetch payment request', 'error');
    } finally {
      setPaymentRequestId(null);
    }
  };

  const handleAddTag = async (invoiceId, tag) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${invoiceId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tag }),
      });
  
      if (!res.ok) {
        throw new Error('Failed to add tag');
      }

      addToast('✅ Tag added successfully');
      fetchInvoices(showArchived, selectedAssignee); // Refresh list
    } catch (err) {
      console.error(err);
      addToast('❌ Failed to add tag', 'error');
    }
  };

  const handleRemoveTag = async (invoiceId, tag) => {
    try {
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      const newTags = (invoice?.tags || []).filter((t) => t !== tag);
      const res = await fetch(`http://localhost:3000/api/invoices/${invoiceId}/update-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tags: newTags }),
      });
      if (!res.ok) throw new Error('Failed to update tags');
      addToast('✅ Tag updated');
      fetchInvoices(showArchived, selectedAssignee);
    } catch (err) {
      console.error(err);
      addToast('❌ Failed to update tags', 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: commentInputs[id] || '' }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchInvoices(showArchived, selectedAssignee);
        setCommentInputs((p) => ({ ...p, [id]: '' }));
      } else {
        addToast('Failed to approve document', 'error');
      }
    } catch (err) {
      console.error('Approve error:', err);
      addToast('Failed to approve document', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: commentInputs[id] || '' }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchInvoices(showArchived, selectedAssignee);
        setCommentInputs((p) => ({ ...p, [id]: '' }));
      } else {
        addToast('Failed to reject document', 'error');
      }
    } catch (err) {
      console.error('Reject error:', err);
      addToast('Failed to reject document', 'error');
    }
  };

  const handleAddComment = async (id, text) => {
    if (!text) return;
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Comment added');
        setCommentInputs((prev) => ({ ...prev, [id]: '' }));
        fetchInvoices(showArchived, selectedAssignee);
        socket.emit('chatMessage', { invoiceId: id, text, user: username });
      } else {
        addToast(data.message || 'Failed to add comment', 'error');
      }
    } catch (err) {
      console.error('Comment error:', err);
      addToast('Failed to add comment', 'error');
    }
  };

  const addCommentFromSnapshot = async (id, text) => {
    if (!text) return;
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Comment added');
        fetchInvoices(showArchived, selectedAssignee);
        socket.emit('chatMessage', { invoiceId: id, text, user: username });
      } else {
        addToast(data.message || 'Failed to add comment', 'error');
      }
    } catch (err) {
      console.error('Comment error:', err);
      addToast('Failed to add comment', 'error');
    }
  };
  

  const handleExportArchived = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/export-archived', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'archived_documents.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export archived failed:', err);
      addToast('❌ Failed to export archived documents', 'error');
    }
  };
  
  
  
  const totalInvoices = sortedInvoices.length;
  const totalAmount = sortedInvoices.reduce((sum, inv) => {
    const amount = parseFloat(inv.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0).toFixed(2);

  
  if (!token) {
    return <Login onLogin={(tok, userRole) => {
      localStorage.setItem('token', tok);
      localStorage.setItem('role', userRole);
      setToken(tok);
      setRole(userRole);
    }} addToast={addToast} />;
  }


  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-900 dark:text-gray-100">
        <Card className="w-full max-w-sm space-y-4">
          <h2 className="text-lg font-semibold mb-4">Login</h2>
          {loginError && <p className="text-red-600 mb-2">{loginError}</p>}
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input w-full mb-3"
          />
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full mb-3"
          />
          <button onClick={handleLogin} className="btn btn-primary w-full">
            Log In
          </button>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.text}
            type={t.type}
            actionText={t.actionText}
            onAction={t.onAction}
          />
        ))}
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <Spinner />
        </div>
      )}
      <ConfirmModal
        open={!!confirmData}
        message={confirmData?.message}
        onConfirm={() => {
          confirmData?.onConfirm?.();
          setConfirmData(null);
        }}
        onCancel={() => setConfirmData(null)}
      />
      {showTimeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded w-96">
            <h2 className="text-lg font-semibold mb-2">Timeline for #{timelineInvoice}</h2>
            <ul className="text-sm max-h-60 overflow-y-auto">
              {Array.isArray(timeline) &&
                timeline.map((t, i) => (
                  <li key={i}>{new Date(t.created_at).toLocaleString()} - {t.action}</li>
                ))}
            </ul>
            <button onClick={() => setShowTimeline(false)} className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded" title="Close">Close</button>
          </div>
        </div>
      )}
      <PreviewModal
        open={!!previewModalData}
        data={previewModalData}
        onClose={() => setPreviewModalData(null)}
        onConfirm={previewModalData?.confirm ? handleUpload : null}
      />
      <InvoiceSnapshotView
        open={!!snapshotInvoice}
        invoice={snapshotInvoice}
        onClose={() => setSnapshotInvoice(null)}
        token={token}
        tenant={tenant}
        onAddComment={addCommentFromSnapshot}
      />
      <InvoiceDetailModal
        open={!!detailInvoice}
        invoice={detailInvoice}
        onClose={() => setDetailInvoice(null)}
        onUpdate={handleUpdateInvoice}
        token={token}
      />
      <Navbar
        tenant={tenant}
        onTenantChange={setTenant}
        notifications={notifications}
        onNotificationsOpen={handleNotificationsOpen}
        role={role}
        onLogout={handleLogout}
        token={token}
        onToggleFilters={() => setFilterSidebarOpen((o) => !o)}
        onUpload={() => fileInputRef.current?.click()}
        search={searchTerm}
        onSearchChange={setSearchTerm}
        smartQuery={smartQuery}
        onSmartQueryChange={setSmartQuery}
        onSmartSearch={handleSmartSearch}
        onStartTour={() => setShowTour(true)}
        activeFilterCount={activeFilters.length}
      />

      {filterSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setFilterSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col md:flex-row md:gap-4 min-h-screen">
        {token && (
          <aside
          className={`order-last md:order-first bg-white dark:bg-gray-800 shadow-lg w-full md:w-64 md:flex-shrink-0 ${
            filterSidebarOpen ? '' : 'hidden'
          } border-r border-gray-200 dark:border-gray-700 max-h-screen overflow-y-auto sticky top-16 z-20`}
        >
          <div className="p-4 space-y-4 overflow-y-auto h-full">
            <SidebarNav notifications={notifications} />
            <button
              className="md:hidden text-right w-full"
              onClick={() => setFilterSidebarOpen(false)}
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold">Filters</h2>
            <div className="space-y-4">
              {/* Search moved to global toolbar */}
              <label htmlFor="archivedToggle" className="flex items-center space-x-2 text-sm mb-4">
                <input
                  id="archivedToggle"
                  type="checkbox"
                  checked={showArchived}
                  onChange={() => setShowArchived(!showArchived)}
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <span>Show Archived</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="vendorSelect" className="text-xs font-medium mb-1">Entity / Company</label>
                  <select
                    id="vendorSelect"
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className="input"
                  >
                    <option value="">All Entities</option>
                    {vendorList.map((vendor, idx) => (
                      <option key={idx} value={vendor}>
                        {vendor}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="assigneeSelect" className="text-xs font-medium mb-1">Assignee</label>
                  <select
                    id="assigneeSelect"
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="input"
                  >
                    <option value="">All Assignees</option>
                    <option value="unassigned">Unassigned</option>
                    {[...new Set([...teamMembers, ...assigneeList])].map((person, idx) => (
                      <option key={idx} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>
                <fieldset className="flex flex-col p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <legend className="text-xs font-medium mb-2">Amount Range</legend>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="minAmount" className="text-xs font-medium mb-1">Min Amount</label>
                    <input
                      id="minAmount"
                      type="number"
                      min="0"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="maxAmount" className="text-xs font-medium mb-1">Max Amount</label>
                    <input
                      id="maxAmount"
                      type="number"
                      min="0"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="input"
                    />
                  </div>
                </fieldset>
                <fieldset className="flex flex-col p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <legend className="text-xs font-medium mb-2">Date Range</legend>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="startDate" className="text-xs font-medium mb-1">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="endDate" className="text-xs font-medium mb-1">End Date</label>
                    <input
                      id="endDate"
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <DateRangeSlider
                    startDate={filterStartDate}
                    endDate={filterEndDate}
                    onChange={([start, end]) => {
                      setFilterStartDate(start);
                      setFilterEndDate(end);
                    }}
                  />
                </fieldset>
              </div>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name"
                  className="input flex-1"
                />
                <button
                  onClick={handleSavePreset}
                  className="bg-indigo-600 text-white px-2 py-1 rounded text-sm"
                >
                  Save
                </button>
              </div>
              {filterPresets.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  <select
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="input flex-1"
                  >
                    <option value="">Select preset</option>
                    {filterPresets.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleApplyPreset(selectedPreset)}
                    className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Load
                  </button>
                </div>
              )}
              <button onClick={handleResetFilters} className="btn btn-secondary text-sm mt-2" title="Reset Filters">
                Reset Filters
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Offline banner removed */}

      <main className="flex-1 w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <PageHeader title="ClarifyOps / AI Dashboard" />
          <LiveFeed token={token} tenant={tenant} />
        </div>
  
        {token ? (
          <>

<div className="mt-6 mb-6">
  <h2 className="text-xl font-bold text-gray-800 mb-2">Upload New Claim File</h2>
  <hr className="mb-4" />
  <fieldset className="p-6 rounded-xl shadow-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-700 border border-gray-200 dark:border-gray-700 flex flex-col gap-4 space-y-4 relative">
    <legend className="text-xl font-bold px-2 flex items-center gap-1">
      <CloudArrowUpIcon className="w-5 h-5 text-indigo-600" />
      <span>Upload Claim File</span>
    </legend>
    <ol className="flex space-x-4 text-sm text-gray-600 mb-2">
      <li className="flex items-center space-x-1">
        <ArrowUpTrayIcon className="w-4 h-4 text-indigo-500" />
        <span>Select File</span>
      </li>
      <li className="flex items-center space-x-1">
        <EyeIcon className="w-4 h-4 text-indigo-500" />
        <span>Preview Rows</span>
      </li>
      <li className="flex items-center space-x-1">
        <CheckCircleIcon className="w-4 h-4 text-indigo-500" />
        <span>Confirm Upload</span>
      </li>
    </ol>
    <motion.div
      id="uploadArea"
      className={`transition-colors duration-200 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer shadow-md ${dragActive ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'bg-white/60 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600'}`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => fileInputRef.current.click()}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <CloudArrowUpIcon className="w-5 h-5" />
        <span>Drag & drop CSV/PDF/Image here or tap to select or capture</span>
      </div>
      <input
        type="file"
        multiple
        accept=".csv,.pdf,.png,.jpg,.jpeg"
        capture="environment"
        ref={fileInputRef}
        disabled={!token}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </motion.div>
    {filePreviews.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {filePreviews.map((f, idx) => (
          <div key={idx} className="border rounded p-2 text-xs">
            <div className="font-semibold">{f.name}</div>
            <div>Size: {(f.size / 1024).toFixed(1)} KB</div>
            <div>Rows: {f.rows}</div>
            {f.file && f.file.type.startsWith('image') && (
              <img
                src={URL.createObjectURL(f.file)}
                alt={f.name}
                className="mt-1 w-16 h-16 object-cover rounded"
              />
            )}
            {f.file && f.file.type === 'application/pdf' && (
              <embed
                src={URL.createObjectURL(f.file)}
                type="application/pdf"
                className="mt-1 w-16 h-16"
              />
            )}
            {f.preview && (
              <button
                onClick={() => setPreviewModalData(f)}
                className="mt-1 text-indigo-700 underline"
                title="Preview rows"
              >
                Preview rows
              </button>
            )}
          </div>
        ))}
      </div>
    )}
    {fileErrors.length > 0 && (
      <ul className="text-red-600 text-xs list-disc list-inside mt-2">
        {fileErrors.map((err, idx) => (
          <li key={idx}>{err}</li>
        ))}
      </ul>
    )}

    {uploadProgress > 0 && (
      <ProgressBar value={uploadProgress} />
    )}

    <CTAButton
      onClick={openUploadPreview}
      disabled={!token || !files.length}
      className="w-full flex items-center justify-center space-x-2 mt-4 sticky bottom-4"
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <ArrowUpTrayIcon className="h-5 w-5" />
      )}
      <span>{loading ? 'Uploading...' : 'Upload Claim File'}</span>
      {uploadSuccess && !loading && (
        <SuccessAnimation className="h-6 w-6" />
      )}
    </CTAButton>

    {recentUploads.length > 0 && (
      <div className="mt-2 text-xs">
        <strong>Recent Uploads:</strong>
        <ul className="list-disc list-inside">
          {recentUploads.map((u, i) => (
            <li key={i}>{u.name} - {u.time}</li>
          ))}
        </ul>
      </div>
    )}
  </fieldset>

</div>
  
            {message && (
              <div className="whitespace-pre-wrap mb-4 text-gray-700">{message}</div>
            )}
  
            {errors.length > 0 && (
              <div className="mb-4">
                <h3 className="text-red-600 font-semibold">Validation Errors:</h3>
                <ul className="list-disc list-inside text-sm text-red-500">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
            <button
              onClick={handleSummarizeErrors}
              className="mt-2 btn btn-warning text-sm"
            >
              Summarize Errors
            </button>
            {summaryLoading && (
              <p className="text-sm text-gray-600 mt-2">Generating summary...</p>
            )}
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiSummary && (
            <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded relative">
              <strong>AI Suggestions:</strong>
              <button
                onClick={() => handleCopy(aiSummary)}
                className="absolute top-2 right-2 text-xs text-indigo-700 hover:underline"
              >
                Copy
              </button>
              <pre className="whitespace-pre-wrap">{aiSummary}</pre>
            </div>
          )}

          {vendorSummary && (
            <div className="p-4 bg-indigo-100 border border-indigo-400 text-indigo-800 rounded relative">
              <strong>Entity Insights:</strong>
              <button
                onClick={() => handleCopy(vendorSummary)}
                className="absolute top-2 right-2 text-xs text-indigo-700 hover:underline"
              >
                Copy
              </button>
              <pre className="whitespace-pre-wrap">{vendorSummary}</pre>
            </div>
          )}

          {monthlyInsights && (
            <div className="p-4 bg-indigo-100 border border-indigo-400 text-indigo-800 rounded relative">
              <strong>Monthly Insights:</strong>
              <button
                onClick={() => handleCopy(monthlyInsights.summary)}
                className="absolute top-2 right-2 text-xs text-indigo-700 hover:underline"
              >
                Copy
              </button>
              <table className="text-xs mb-2">
                <thead>
                  <tr>
                    <th className="pr-4 text-left">Entity</th>
                    <th className="pr-4 text-right">Total</th>
                    <th className="text-right">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyInsights.vendorTotals.map((v) => (
                    <tr key={v.vendor}>
                      <td className="pr-4">{v.vendor}</td>
                      <td className="pr-4 text-right">${v.total.toFixed(2)}</td>
                      <td className="text-right">
                        {v.percentChange > 0 ? '+' : ''}{v.percentChange.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <pre className="whitespace-pre-wrap">{monthlyInsights.summary}</pre>
            </div>
          )}
        </div>


                 {selectedInvoices.length > 0 && (
                        <div className="mb-4 bg-indigo-50 border border-indigo-200 p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                          <span className="text-indigo-700 text-sm">
                            ✅ {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex space-x-2">
                            {!showArchived && role === 'approver' && (
                              <>
                                <button
                                  onClick={handleBulkArchive}
                                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                >
                                  Archive Selected
                                </button>
                                <button
                                  onClick={handleBulkDelete}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                  Delete Selected
                                </button>
                              </>
                            )}
                            {showArchived && role === 'approver' && (
                              <button
                                onClick={handleBulkUnarchive}
                                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                              >
                                Unarchive Selected
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                     {/* Action Toolbar */}
                      <ActionToolbar
                        role={role}
                        token={token}
                        loading={loading}
                        loadingVendor={loadingVendor}
                        loadingInsights={loadingInsights}
                        onUpload={handleUpload}
                        onVendorSummary={handleVendorSummary}
                        onMonthlyInsights={handleMonthlyInsights}
                        onExportFiltered={handleExport}
                        onExportAll={handleExportAll}
                        onExportDashboard={handleExportDashboardPDF}
                        onExportArchived={handleExportArchived}
                        onReset={handleResetFilters}
                        onClear={handleClearAll}
                        onToggleFilters={() => setFilterSidebarOpen((o) => !o)}
                        activeFilterCount={activeFilters.length}
                      />

                      <div className="flex justify-end mb-2 space-x-4">
                        <button
                          onClick={() => setShowChart(!showChart)}
                          className="text-sm text-indigo-700 underline hover:text-indigo-900"
                        >
                          {showChart ? 'Hide Chart' : 'Show Chart'}
                        </button>
                        {viewMode !== 'graph' && (
                          <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                            className="text-sm text-indigo-700 underline hover:text-indigo-900"
                          >
                            {viewMode === 'table' ? '📇 Card View' : '📊 Table View'}
                          </button>
                        )}
                        <button
                          onClick={() => setViewMode(viewMode === 'graph' ? 'table' : 'graph')}
                          className="text-sm text-indigo-700 underline hover:text-indigo-900"
                        >
                          {viewMode === 'graph' ? '📊 Table View' : '🕸 Graph View'}
                        </button>

                      </div>


                <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-800">
                  Claim Totals by Entity
                </h2>
                <div className="mb-4 flex flex-wrap gap-4">
                  {Object.keys(visibleColumns).map((col) => (
                    <label key={col} className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={visibleColumns[col]}
                        onChange={() =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [col]: !prev[col],
                          }))
                        }
                      />
                      {col
                        .replace('_', ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  ))}
                </div>
                          {showChart && (
                        <>
                      <div className="h-64">
                        {loadingCharts ? (
                          <Skeleton rows={1} className="h-full" height="h-full" />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="entity" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="total" fill="#3B82F6" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <div className="flex items-center my-4 space-x-2">
                        <label className="text-sm">Interval:</label>
                        <select
                          value={cashFlowInterval}
                          onChange={(e) => setCashFlowInterval(e.target.value)}
                          className="input p-1 text-sm"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div className="h-64">
                        {loadingCharts ? (
                          <Skeleton rows={1} className="h-full" height="h-full" />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cashFlowData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="period"
                                tickFormatter={(v) => new Date(v).toLocaleDateString()}
                              />
                              <YAxis />
                              <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                              <Line type="monotone" dataKey="total" stroke="#10B981" />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mt-8 mb-2 text-gray-800">Top 5 Entities This Quarter</h3>
                      <div className="flex items-center my-2 space-x-2 text-sm">
                        <label>Filter:</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="input p-1"
                        >
                          <option value="none">None</option>
                          <option value="tag">Tag</option>
                          <option value="date">Date Range</option>
                          <option value="amount">Amount Range</option>
                        </select>
                        {filterType === 'tag' && (
                          <input
                            type="text"
                            value={filterTag}
                            onChange={(e) => setFilterTag(e.target.value)}
                            placeholder="Tag"
                            className="input p-1"
                          />
                        )}
                        {filterType === 'date' && (
                          <>
                            <input
                              type="date"
                              value={filterStartDate}
                              onChange={(e) => setFilterStartDate(e.target.value)}
                              className="input p-1"
                            />
                            <input
                              type="date"
                              value={filterEndDate}
                              onChange={(e) => setFilterEndDate(e.target.value)}
                              className="input p-1"
                            />
                          </>
                        )}
                        {filterType === 'amount' && (
                          <>
                            <input
                              type="number"
                              value={filterMinAmount}
                              onChange={(e) => setFilterMinAmount(e.target.value)}
                              placeholder="Min"
                              className="input p-1"
                            />
                            <input
                              type="number"
                              value={filterMaxAmount}
                              onChange={(e) => setFilterMaxAmount(e.target.value)}
                              placeholder="Max"
                              className="input p-1"
                            />
                          </>
                        )}
                      </div>
                      <div className="h-64">
                        {loadingCharts ? (
                          <Skeleton rows={1} className="h-full" height="h-full" />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topVendors}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="entity" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="total" fill="#6366F1" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mt-8 mb-2 text-gray-800">Spending by Tag</h3>
                      <div className="h-64">
                        {loadingCharts ? (
                          <Skeleton rows={1} className="h-full" height="h-full" />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tagReport}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="tag" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="total" fill="#0ea5e9" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      </>
                    )}
                <h2 className="text-xl font-bold text-gray-800 mb-2">Invoices</h2>
                <hr className="mb-4" />
                <div className="flex justify-between items-center mt-6 mb-2 text-sm text-gray-700">
                  <span>Total Invoices: <strong>{totalInvoices}</strong></span>
                  <span>Total Amount: <strong>${totalAmount}</strong></span>
                </div>
                <div className="overflow-x-auto mt-6 max-h-[500px] overflow-y-auto rounded border">
                  <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b p-2 flex flex-wrap items-center gap-2">
                    {activeFilters.map((f, idx) => (
                      <span key={idx} className="bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 text-xs px-2 py-1 rounded">
                        {f}
                      </span>
                    ))}
                    {filterPresets.length > 0 && (
                      <select
                        value={selectedPreset}
                        onChange={(e) => {
                          setSelectedPreset(e.target.value);
                          handleApplyPreset(e.target.value);
                        }}
                        className="input text-xs ml-auto"
                      >
                        <option value="">Presets</option>
                        {filterPresets.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                {viewMode !== 'graph' && (
                  viewMode === 'table' ? (
              <div className="overflow-x-auto mt-6 max-h-[500px] overflow-y-auto rounded-lg border">
              <table id="documentTable" className="min-w-full bg-white border border-gray-300 text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-700 sticky top-8 z-10 shadow-md">
                  <tr>
                    <th className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort('invoice_number')}>
                      Claim Document #
                      {sortConfig.key === 'invoice_number' && (
                        <span>{sortConfig.direction === 'asc' ? ' ⬆' : ' ⬇'}</span>
                      )}
                    </th>
                    <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort('date')}>
                      Date
                      {sortConfig.key === 'date' && (
                        <span>{sortConfig.direction === 'asc' ? ' ⬆' : ' ⬇'}</span>
                      )}
                    </th>
                    <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort('amount')}>
                      Amount
                      {sortConfig.key === 'amount' && (
                        <span>{sortConfig.direction === 'asc' ? ' ⬆' : ' ⬇'}</span>
                      )}
                    </th>
                    <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort('vendor')}>
                      Entity
                      {sortConfig.key === 'vendor' && (
                        <span>{sortConfig.direction === 'asc' ? ' ⬆' : ' ⬇'}</span>
                      )}
                    </th>
                    <th className="border px-4 py-2">Smart Tags</th>
                    <th className="border px-4 py-2">Created At</th>
                    <th className="border px-4 py-2">Assignee</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Updated At</th>
                    <th className="border px-4 py-2">Quality</th>
                    <th className="border px-4 py-2">Risk</th>
                    {role !== 'viewer' && (
                      <th className="border px-4 py-2">Actions</th>
                    )}
                    
                  </tr>
                </thead>

              <tbody>
              {loadingInvoices ? (
                <tr>
                  <td colSpan={role !== 'viewer' ? 14 : 13} className="py-6"><Skeleton rows={5} height="h-4" /></td>
                </tr>
              ) : sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={role !== 'viewer' ? 14 : 13}>
                    <EmptyState
                      onCta={() => fileInputRef.current?.click()}
                      headline="Let's get started!"
                      description="Upload your first claim file to begin tracking spend, surfacing anomalies, and unlocking AI insights."
                      cta="Upload Claim File"
                    />
                  </td>
                </tr>
              ) : (
                
                sortedInvoices.map((inv, idx) => (
                  <React.Fragment key={inv.id}>
                  <motion.tr
                          className={`text-center hover:bg-gray-100 hover:shadow ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } ${
                            inv.archived ? '!bg-gray-200 text-gray-600 italic' : ''
                          } ${
                            recentInvoices.includes(inv.id) ? 'bg-green-100 border-green-400' : ''
                          } ${
                            selectedVendor && inv.vendor === selectedVendor ? 'bg-indigo-50 border-indigo-300' : ''
                          } ${
                            role === 'approver' && (inv.approval_status || 'Pending') === 'Pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900'
                              : ''
                          } ${highlightIndex === idx ? 'ring-2 ring-indigo-500' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        >
                    <td className="border px-4 py-2 flex items-center space-x-1">
                      <button onClick={() => setExpandedRows((r) => r.includes(inv.id) ? r.filter(i => i !== inv.id) : [...r, inv.id])} className="text-xs">
                        {expandedRows.includes(inv.id) ? '▼' : '▶'}
                      </button>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(inv.id)}
                        onChange={() => toggleSelectInvoice(inv.id)}
                      />
                    </td>
                    <td className="border px-4 py-2">{inv.id}</td>
                    <td className="border px-4 py-2 cursor-pointer" onClick={() => openInvoiceDetails(inv)}>
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{inv.invoice_number}</span>
                        <div className="flex space-x-1 mt-1">
                          {recentInvoices.includes(inv.id) && (
                            <span title="New" className="text-green-600 text-[10px] font-semibold">🆕 New</span>
                          )}
                          {inv.paid && (
                            <span title="Paid" className="text-green-600 text-[10px] font-semibold">✅ Paid</span>
                          )}
                          {inv.archived && (
                            <span title="Archived" className="text-gray-600 text-[10px] font-semibold">📦 Archived</span>
                          )}
                          {duplicateFlags[inv.id] && (
                            <span title="Possible duplicate" className="text-yellow-500 text-[10px] font-semibold">⚠️</span>
                          )}
                          {inv.flagged && <FlaggedBadge id={inv.id} />}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`border px-4 py-2 ${role !== 'viewer' ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (role === 'viewer') return;
                        setEditingInvoiceId(inv.id);
                        setEditingField('date');
                        setEditingValue(inv.date);
                      }}
                    >
                      {editingInvoiceId === inv.id && editingField === 'date' ? (
                        <input
                          type="date"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateInvoice(inv.id, 'date', editingValue);
                            setEditingInvoiceId(null);
                          }}
                          className="input px-1 text-sm w-full"
                          autoFocus
                        />
                      ) : (
                        <>
                          {inv.date ? new Date(inv.date).toLocaleDateString() : ''}
                          {updatedFields[`${inv.id}-date`] && (
                            <span className="ml-2 text-green-600 text-xs font-semibold">✅</span>
                          )}
                        </>
                      )}
                    </td>
                    <td
                      className={`border px-4 py-2 ${role !== 'viewer' ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (role === 'viewer') return;
                        setEditingInvoiceId(inv.id);
                        setEditingField('amount');
                        setEditingValue(inv.amount);
                      }}
                    >
                      {editingInvoiceId === inv.id && editingField === 'amount' ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateInvoice(inv.id, 'amount', editingValue);
                            setEditingInvoiceId(null);
                          }}
                          disabled={updatingField === `${inv.id}-amount`}
                          className="border px-1 text-sm w-full"
                          autoFocus
                        />
              
                      ) : (
                        <>
                          {inv.amount ? `$${parseFloat(inv.amount).toFixed(2)}` : ''}
                          {updatedFields[`${inv.id}-amount`] && (
                            <span className="ml-2 text-green-600 text-xs font-semibold">✅</span>
                          )}
                        </>
                      )}
                    </td>
                    <td
                      className={`border px-4 py-2 ${role !== 'viewer' ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (role === 'viewer') return;
                        setEditingInvoiceId(inv.id);
                        setEditingField('vendor');
                        setEditingValue(inv.vendor);
                      }}
                    >
                      {editingInvoiceId === inv.id && editingField === 'vendor' ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateInvoice(inv.id, 'vendor', editingValue);
                            setEditingInvoiceId(null);
                          }}
                          className="input px-1 text-sm w-full"
                          autoFocus
                        />

                      ) : (
                        <div className="flex items-center space-x-1">
                          <span>{inv.vendor}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setVendorPanelVendor(inv.vendor); }}
                            className="text-indigo-600 underline text-xs"
                            title="Profile"
                          >
                            Info
                          </button>
                          {updatedFields[`${inv.id}-vendor`] && (
                            <span className="ml-1 text-green-600 text-xs font-semibold">✅</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      <TagEditor
                        tags={inv.tags || []}
                        colorMap={tagColors}
                        onAddTag={(tag) => handleAddTag(inv.id, tag)}
                        onRemoveTag={(tag) => handleRemoveTag(inv.id, tag)}
                      />
                    </td>
                    <td className="border px-4 py-2">
                      {inv.created_at ? new Date(inv.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="border px-4 py-2">
                      <select
                        value={inv.assignee || ''}
                        onChange={(e) => handleAssign(inv.id, e.target.value)}
                        className="border rounded px-1 text-sm"
                        disabled={role === 'viewer'}
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border px-4 py-2">{inv.approval_status || 'Pending'}</td>
                    <td className="border px-4 py-2">
                      {inv.updated_at ? new Date(inv.updated_at).toLocaleString() : '—'}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleQualityScore(inv)}
                        className="bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 text-xs w-full"
                        title={qualityScores[inv.id]?.tips || ''}
                      >
                        {qualityScores[inv.id] ? `💯 ${qualityScores[inv.id].score}` : 'Score'}
                      </button>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleRiskScore(inv)}
                        className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 text-xs w-full"
                      >
                        {riskScores[inv.id] || 'Risk'}
                      </button>
                    </td>
                    {role !== 'viewer' && (
                    <td className="border px-4 py-2 space-y-1 flex flex-col items-center">
                    {!inv.archived && (
                            <>
                              {role === 'admin' && (
                                <button
                                  onClick={() => handleDelete(inv.id)}
                                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs w-full"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                              {role === 'approver' && (
                                <button
                                  onClick={() => handleArchive(inv.id)}
                                  className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 text-xs w-full"
                                  title="Archive"
                                >
                                  <ArchiveBoxIcon className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}

                        <button
                            onClick={() => handleDownloadPDF(inv.id)}
                            className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 text-xs w-full"
                            title="Download PDF"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>

                      {inv.archived && role === 'approver' && (
                        <button
                          onClick={() => handleUnarchive(inv.id)}
                          className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 text-xs w-full"
                          title="Unarchive"
                        >
                          <ArrowUturnUpIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleSuggestVendor(inv)}
                        className="btn btn-primary text-xs w-full"
                        title="Suggest Vendor"
                      >
                        <LightBulbIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSuggestTags(inv)}
                        className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 text-xs w-full"
                        title="Suggest Tags"
                      >
                        <TagIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExplainInvoice(inv)}
                        className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 text-xs w-full"
                        title="Explain"
                      >
                        🧠
                      </button>
                      {tagSuggestions[inv.id] && (
                        <SuggestionChips
                          suggestions={tagSuggestions[inv.id]}
                          onClick={(tag) => handleAddTag(inv.id, tag)}
                        />
                      )}
                      {role === 'approver' && (
                        <button
                          onClick={() => handleFlagSuspicious(inv)}
                          className="btn btn-warning text-xs w-full px-2 py-1"
                          title="Flag"
                        >
                          <FlagIcon className="w-4 h-4" />
                        </button>
                      )}
                        <button
                          onClick={() => handleViewTimeline(inv.id)}
                          className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs w-full"
                          title="Timeline"
                        >
                          <ClockIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePaymentRequest(inv.id)}
                          className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 text-xs w-full"
                          disabled={paymentRequestId === inv.id}
                        >
                          {paymentRequestId === inv.id ? (
                            <Spinner className="h-3 w-3" />
                          ) : (
                            <CurrencyDollarIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(inv.id)}
                          className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 text-xs w-full flex justify-center items-center space-x-1 disabled:opacity-50"
                          disabled={downloadingId === inv.id}
                        >
                        {downloadingId === inv.id ? (
                            <Spinner className="h-3 w-3" />
                          ) : (
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          )}
                      </button>

                      {vendorSuggestions[inv.id] && (
                        <SuggestionChips
                          suggestions={[vendorSuggestions[inv.id]]}
                          onClick={(v) => handleUpdateInvoice(inv.id, 'vendor', v)}
                        />
                      )}
                      {suspicionFlags[inv.id] && (
                        <div className="text-xs text-yellow-800 mt-1 text-center">
                          🚩 {suspicionFlags[inv.id]}
                        </div>
                      )}
                      {(role === 'approver' || role === 'admin') && (
                        <>
                          <button
                            onClick={() => handleApprove(inv.id)}
                            className="bg-green-500 text-white px-2 py-1 mt-1 rounded hover:bg-green-600 text-xs w-full"
                            title="Approve"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(inv.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs w-full"
                            title="Reject"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                  </td>
                  )}
                  </motion.tr>
                  {expandedRows.includes(inv.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan={role !== 'viewer' ? 14 : 13} className="p-2 text-left">
                        {inv.comments?.length ? (
                          inv.comments.map((c, i) => (
                            <div key={i} className="text-xs mb-1">{c.text}</div>
                          ))
                        ) : (
                          <em className="text-xs text-gray-600">No comments</em>
                        )}
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>

              </table>
              </div>
                ) : viewMode === 'card' ? (
                  // 👇 step 2 goes here
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {loadingInvoices ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="h-32 bg-gray-200 rounded animate-pulse" />
                    ))
                  ) : sortedInvoices.map((inv) => {
                    const status = inv.flagged ? 'Flagged' : inv.approval_status || 'Pending';
                    const statusClass =
                      status === 'Approved'
                        ? 'text-green-800 bg-green-100'
                        : status === 'Flagged' || status === 'Rejected'
                        ? 'text-red-800 bg-red-100'
                        : 'text-yellow-800 bg-yellow-100';
                    return (
                      <div
                        key={inv.id}
                        onClick={() => openInvoiceDetails(inv)}
                        className={`border rounded-lg p-4 shadow-md flex flex-col h-full space-y-2 ${
                          inv.archived ? 'bg-gray-100 text-gray-600 italic' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <img src="/logo192.png" alt="logo" className="w-8 h-8 object-contain rounded" />
                          <span className="text-sm font-semibold">{inv.vendor}</span>
                        </div>
                        <div className="flex-1 text-sm space-y-1">
                          <div>
                            #{inv.invoice_number} {duplicateFlags[inv.id] && <span className="text-yellow-500">⚠️</span>} {inv.flagged && <FlaggedBadge id={inv.id} />}
                          </div>
                          <div>💰 {inv.amount}</div>
                          <div>📅 {new Date(inv.date).toLocaleDateString()}</div>
                          <TagEditor
                            tags={inv.tags || []}
                            colorMap={tagColors}
                            onAddTag={(tag) => handleAddTag(inv.id, tag)}
                            onRemoveTag={(tag) => handleRemoveTag(inv.id, tag)}
                          />
                          {inv.comments?.map((c, i) => (
                            <div key={i} className="text-xs bg-gray-100 rounded p-1">{c.text}</div>
                          ))}
                          {role !== 'viewer' && (
                            <div className="flex mt-1">
                              <CollaborativeCommentInput
                                invoiceId={inv.id}
                                onChange={(v) => setCommentInputs((p) => ({ ...p, [inv.id]: v }))}
                                onSubmit={(text) => {
                                  handleAddComment(inv.id, text);
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComment(inv.id, commentInputs[inv.id]);
                                }}
                                className="bg-indigo-600 text-white text-xs px-2 py-1 ml-1 rounded"
                              >
                                Post
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${statusClass}`}>{status}</span>
                          <div className="flex space-x-1">
                            {!inv.archived && role === 'approver' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchive(inv.id);
                                }}
                                className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                                title="Archive"
                              >
                                <ArchiveBoxIcon className="w-4 h-4" />
                              </button>
                            )}
                            {role === 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(inv.id);
                                }}
                                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                            {(role === 'approver' || role === 'admin') && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(inv.id);
                                  }}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                  title="Approve"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(inv.id);
                                  }}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                  title="Reject"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePaymentRequest(inv.id);
                                  }}
                                  className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
                                  disabled={paymentRequestId === inv.id}
                                >
                                  {paymentRequestId === inv.id ? (
                                    <Spinner className="h-3 w-3" />
                                  ) : (
                                    <CurrencyDollarIcon className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExplainInvoice(inv);
                                  }}
                                  className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
                                  title="Explain"
                                >
                                  🧠
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                ) : null)}
              
              {selectedInvoices.length > 0 && (
                  <div className="mt-4 flex space-x-2 justify-center bg-indigo-50 p-3 rounded border border-indigo-300">
                    <span className="text-sm text-gray-700 self-center">
                      {selectedInvoices.length} selected
                    </span>
                    <button
                      onClick={handleBulkArchive}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                    >
                      📦 Archive Selected
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      🗑️ Delete Selected
                    </button>
                    <button
                      onClick={handleBulkUnarchive}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                    >
                      ♻️ Unarchive Selected
                    </button>
                  </div>
                )}
              <div className="mt-4 flex justify-center space-x-2">
                {Array.from({ length: Math.ceil(sortedInvoices.length / itemsPerPage) }).map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === index + 1
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                )}
              </div>
              </div>
            {viewMode === 'graph' && (
            <GraphView token={token} tenant={tenant} />
          )}
          </>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-300 mt-8">
            🔒 Please log in to access document management tools.
          </div>
        )}
      </main>
      {token && (
        <>
          <button
            onClick={openUploadPreview}
            className="fixed bottom-4 right-20 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-30"
            title="Upload Claim File"
            aria-label="Upload claim file"
          >
            <ArrowUpTrayIcon className="w-6 h-6" />
          </button>
          <AIAssistantPanel
            onAsk={() => setAssistantOpen(true)}
            onFeature={() => setFeatureOpen(true)}
            onSummary={handleSummary}
            onPattern={handlePattern}
            onCategorize={handleCategorize}
            onTagging={handleTagging}
          />
          <ChatSidebar
            open={assistantOpen}
            onClose={() => setAssistantOpen(false)}
            onAsk={handleAssistantQuery}
            onUpload={handleConversationalUpload}
            onChart={handleChartQuery}
            onBilling={handleBillingQuery}
            history={chatHistory}
            loading={loadingAssistant}
          />
          <VendorProfilePanel
            vendor={vendorPanelVendor}
            open={!!vendorPanelVendor}
            onClose={() => setVendorPanelVendor(null)}
            token={token}
          />
          <BulkSummary
            open={!!bulkSummary}
            summary={bulkSummary}
            onClose={() => setBulkSummary(null)}
          />
          <ExplanationModal
            open={!!explainModal}
            invoice={explainModal?.invoice}
            explanation={explainModal?.explanation}
            score={explainModal?.score}
            onClose={() => setExplainModal(null)}
          />
          <Joyride
            steps={tourSteps}
            run={showTour}
            showSkipButton
            continuous
            styles={{ options: { zIndex: 10000 } }}
            callback={(data) => {
              if (['finished', 'skipped'].includes(data.status)) {
                setShowTour(false);
                localStorage.setItem('seenTour', '1');
              }
            }}
          />
          <FeatureWidget open={featureOpen} onClose={() => setFeatureOpen(false)} />
        </>
      )}
      </div>
    </div>
  );
}

export default ClaimsPage;
