import React, { useState, useEffect, useRef } from 'react';
import LiveFeed from './components/LiveFeed';
import TenantSwitcher from './components/TenantSwitcher';
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
import Toast from './components/Toast';
import Skeleton from './components/Skeleton';
import NotificationBell from './components/NotificationBell';
import GraphView from './components/GraphView';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowUturnUpIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FlagIcon,
  LightBulbIcon,
  PlusCircleIcon,
  TagIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const teamMembers = ['Alice', 'Bob', 'Charlie'];



function App() {
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
const [files, setFile] = useState([]);   // file objects to upload
const [filePreviews, setFilePreviews] = useState([]);
const [dragActive, setDragActive] = useState(false);
const fileInputRef = useRef();
const searchInputRef = useRef();
  const [invoices, setInvoices] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
  const [vendorSuggestions, setVendorSuggestions] = useState({});
  const [suspicionFlags] = useState({});
  const [duplicateFlags, setDuplicateFlags] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [vendorList, setVendorList] = useState([]);
  const [assigneeList, setAssigneeList] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [tenant, setTenant] = useState(() => localStorage.getItem('tenant') || 'default');
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [cashFlowInterval, setCashFlowInterval] = useState('monthly');
  const [timeline, setTimeline] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineInvoice, setTimelineInvoice] = useState(null);
  const [topVendors, setTopVendors] = useState([]);
  const [tagReport, setTagReport] = useState([]);
  const [filterType, setFilterType] = useState('none');
  const [filterTag, setFilterTag] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingField, setEditingField] = useState(null); // format: { id, field }
  const [editValue, setEditValue] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [updatedFields, setUpdatedFields] = useState({});
  const [updatingField, setUpdatingField] = useState(null);
  const [tagSuggestions, setTagSuggestions] = useState({});
  const [tagColors, setTagColors] = useState({});
  const [qualityScores, setQualityScores] = useState({});
  const [riskScores, setRiskScores] = useState({});
  const [chartQuestion, setChartQuestion] = useState('');
  const [chartDataAuto, setChartDataAuto] = useState([]);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('viewMode') || 'table';
  });

  const [downloadingId, setDownloadingId] = useState(null);
  const [paymentRequestId, setPaymentRequestId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [tagInputs, setTagInputs] = useState({});


  const addToast = (
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
  };

  const addNotification = (text) => {
    const n = { id: Date.now(), text, read: false };
    setNotifications((prev) => [n, ...prev]);
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  async function syncPendingActions() {
    const pending = JSON.parse(localStorage.getItem('pendingActions') || '[]');
    if (!pending.length) return;
    for (const action of pending) {
      try {
        await fetch(action.url, action.options);
      } catch (err) {
        console.error('Failed to sync action', action, err);
        return;
      }
    }
    localStorage.removeItem('pendingActions');
    fetchInvoices(showArchived, selectedAssignee);
  }

  
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('tenant', tenant);
  }, [tenant]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const orig = window.fetch;
    window.fetch = async (url, options = {}) => {
      const headers = { 'X-Tenant-Id': tenant, ...(options.headers || {}) };
      if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
      }
      try {
        return await orig(url, { ...options, headers });
      } catch (err) {
        if (!navigator.onLine && options.method && options.method !== 'GET') {
          const pending = JSON.parse(localStorage.getItem('pendingActions') || '[]');
          pending.push({ url, options: { ...options, headers } });
          localStorage.setItem('pendingActions', JSON.stringify(pending));
          addToast('⏸️ Action queued offline', 'error');
          throw err;
        }
        throw err;
      }
    };
    return () => {
      window.fetch = orig;
    };
  }, [tenant, token]);

  useEffect(() => {
    const goOnline = () => {
      setIsOffline(false);
      syncPendingActions();
    };
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    if (navigator.onLine) {
      syncPendingActions();
    }
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [tenant, token]);

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
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedInvoices, invoices]);

  useEffect(() => {
    if (showChart && token) {
      fetchCashFlowData(cashFlowInterval);
      fetchTopVendors();
      fetchTagReport();
    }
  }, [showChart, cashFlowInterval, token, filterType, filterTag, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount]);
  


  const filteredInvoices = invoices
  .filter((inv) => {
    const term = searchTerm.toLowerCase();
    const vendorMatch = inv.vendor?.toLowerCase().includes(term);
    const tagMatch = inv.tags?.some((t) => t.toLowerCase().includes(term));
    const descMatch = inv.description?.toLowerCase().includes(term);
    return vendorMatch || tagMatch || descMatch;
  })
  .filter((inv) => !selectedVendor || inv.vendor === selectedVendor)
  .filter((inv) => !selectedAssignee || inv.assignee === selectedAssignee)
  .filter((inv) => {
    const amount = parseFloat(inv.amount);
    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);

    if (isNaN(amount)) return false;
    if (minAmount && amount < min) return false;
    if (maxAmount && amount > max) return false;

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


  const allSelected = selectedInvoices.length === sortedInvoices.length && sortedInvoices.length > 0;


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
  
  const handleBulkArchive = () => {
    selectedInvoices.forEach((id) => handleArchive(id));
    setSelectedInvoices([]);
  };
  
  const handleBulkDelete = () => {
    selectedInvoices.forEach((id) => handleDelete(id));
    setSelectedInvoices([]);
  };
  
  const handleBulkUnarchive = () => {
    selectedInvoices.forEach((id) => handleUnarchive(id));
    setSelectedInvoices([]);
  };
  
  const handleUpdateInvoice = async (id, field, value) => {
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
        addToast('❌ Failed to update invoice', 'error');
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
        addNotification(`New invoice assigned to ${assignee}`);
        setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, assignee } : inv)));
      } else {
        addToast('❌ Failed to assign invoice', 'error');
      }
    } catch (err) {
      console.error('Assign error:', err);
      addToast('⚠️ Failed to assign invoice', 'error');
    }
  };
  
  

  const vendorTotals = invoices.reduce((acc, inv) => {
    if (!inv.vendor || !inv.amount) return acc;
    const vendor = inv.vendor;
    const amount = parseFloat(inv.amount);
    acc[vendor] = (acc[vendor] || 0) + amount;
    return acc;
  }, {});
  
  const chartData = Object.entries(vendorTotals).map(([vendor, total]) => ({
    vendor,
    total,
  }));
  

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
}, [showArchived, selectedAssignee]);

  

  useEffect(() => {
    const vendors = [...new Set(invoices.map(inv => inv.vendor))];
    setVendorList(vendors);
  }, [invoices]);
  
  

  const handleFiles = async (fileList) => {
    const arr = Array.from(fileList);
    const previews = await Promise.all(
      arr.map(async (f) => {
        let rows = 'N/A';
        if (f.name.toLowerCase().endsWith('.csv')) {
          const text = await f.text();
          rows = Math.max(text.trim().split(/\r?\n/).length - 1, 0);
        }
        return { file: f, name: f.name, size: f.size, rows };
      })
    );
    setFile(arr);
    setFilePreviews(previews);
  };

  const handleUpload = async () => {
    if (!files.length) return addToast('Please select one or more files', 'error');
  
    setLoading(true);
  
    for (const file of files) {
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
  
        setMessage((prev) => prev + `\n✅ ${data.inserted} invoice(s) uploaded from ${file.name}`);
        addToast(`✅ Uploaded ${data.inserted} invoice(s) from ${file.name}`);
        if (data.errors?.length) {
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
        console.error(`Upload failed for ${file.name}:`, err);
        setMessage((prev) => prev + `\n❌ Upload failed for ${file.name}`);
      }
    }

    addToast('📧 Email sent with summary and invoice list!');
  
    const updated = await fetch('http://localhost:3000/api/invoices');
    const updatedData = await updated.json();
    setInvoices(updatedData);
    const newIds = updatedData
      .filter(inv => !invoices.some(existing => existing.id === inv.id))
      .map(inv => inv.id);

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
  };
  
    const fetchInvoices = async (includeArchived = false, assigneeFilter = '') => {
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
        setInvoices(data);
        localStorage.setItem('cachedInvoices', JSON.stringify(data));
        // Extract unique vendors and assignees from invoices
        const vendors = Array.from(new Set(data.map(inv => inv.vendor).filter(Boolean)));
        setVendorList(vendors);
        const assignees = Array.from(new Set(data.map(inv => inv.assignee).filter(Boolean)));
        setAssigneeList(Array.from(new Set([...teamMembers, ...assignees])));

        const uniqueTags = Array.from(new Set(data.flatMap(inv => inv.tags || [])));
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
            const colorData = await colorRes.json();
            if (colorRes.ok && colorData.colors) {
              setTagColors(colorData.colors);
            }
          } catch (e) {
            console.error('Tag color fetch failed:', e);
          }
        }

        // Detect duplicates by vendor+date+amount
        const groups = {};
        data.forEach(inv => {
          const key = `${inv.vendor}|${new Date(inv.date).toISOString().slice(0,10)}|${inv.amount}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(inv.id);
        });
        const dupMap = {};
        Object.values(groups).forEach(list => {
          if (list.length > 1) list.forEach(id => { dupMap[id] = true; });
        });
        setDuplicateFlags(dupMap);

        if (Object.keys(dupMap).length > 0) {
          addToast('⚠️ Duplicate invoices detected', 'error');
        }

        return data;
      } catch (err) {
        console.error('Fetch error:', err);
        const cached = localStorage.getItem('cachedInvoices');
        if (cached) {
          setInvoices(JSON.parse(cached));
          setIsOffline(true);
          setMessage('Offline mode: showing cached invoices');
        } else {
          setMessage('❌ Could not load invoices');
        }
      } finally {
        setLoadingInvoices(false);
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

  const handleSummarizeErrors = async () => {
    if (!errors.length) return;
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

  const fetchCashFlowData = async (interval = cashFlowInterval) => {
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
  };

  const fetchTopVendors = async () => {
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
      const res = await fetch(`http://localhost:3000/api/invoices/top-vendors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTopVendors(data.topVendors || []);
      } else {
        addToast('Failed to fetch top vendors', 'error');
      }
    } catch (err) {
      console.error('Top vendors fetch error:', err);
      addToast('Failed to fetch top vendors', 'error');
    }
  };

  const fetchTagReport = async () => {
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
  };
  

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

  const handleAssistantQuery = async () => {
    if (!chatQuestion.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/api/invoices/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: chatQuestion }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatAnswer(data.answer);
      } else {
        setChatAnswer(data.message || 'Error');
      }
    } catch (err) {
      console.error('Assistant query failed:', err);
      setChatAnswer('Failed to get answer.');
    }
  };

  const handleChartQuery = async () => {
    if (!chartQuestion.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/api/invoices/nl-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: chartQuestion }),
      });
      const data = await res.json();
      if (res.ok) {
        setChartDataAuto(data.rows);
      } else {
        setChartDataAuto([]);
        addToast(data.message, 'error');
      }
    } catch (err) {
      console.error('Chart query failed:', err);
      setChartDataAuto([]);
      addToast('Failed to run query', 'error');
    }
  };
  

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete invoice #${id}?`
    );
    if (!confirmDelete) return;

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
        addToast('Failed to delete invoice.', 'error');
      }
    }, 5000);

    addToast(`Invoice #${id} deleted`, 'success', {
      duration: 5000,
      actionText: 'Undo',
      onAction: undo,
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
    try {
      const res = await fetch('http://localhost:3000/api/invoices/login', {
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
  
  const handleClearAll = async () => {
    const confirmClear = window.confirm('⚠️ Are you sure you want to delete all invoices?');
    if (!confirmClear) return;
  
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
      addToast('❌ Failed to clear invoices.', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedVendor('');
    setMinAmount('');
    setMaxAmount('');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast('📋 Copied to clipboard!');
  };
  
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
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
  
  const handleFlagSuspicious = async (invoice) => {
    try {
      const res = await fetch('http://localhost:3000/api/invoices/flag-suspicious', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // include token if required
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
      addToast('🚩 ⚠️ Failed to flag invoice.', 'error');
    }
  };

  const handleViewTimeline = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTimelineInvoice(id);
      setTimeline(data);
      setShowTimeline(true);
    } catch (err) {
      console.error('Timeline fetch failed:', err);
      addToast('Failed to load timeline', 'error');
    }
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
  
  const handleArchive = async (id) => {
    const confirmArchive = window.confirm(`Are you sure you want to archive invoice #${id}?`);
    if (!confirmArchive) return;
  
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/archive`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      addToast(`📦 ${data.message}`);
  
      // Refresh invoice list
      const updated = await fetch('http://localhost:3000/api/invoices');
      const updatedData = await updated.json();
      setInvoices(updatedData);
    } catch (err) {
      console.error('Archive error:', err);
      addToast('⚠️ Failed to archive invoice.', 'error');
    }
  };
  
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
  
      // Refresh only if still viewing archived invoices
      if (showArchived) {
        fetchInvoices(showArchived, selectedAssignee);
      }
    } catch (err) {
      console.error('Unarchive error:', err);
      addToast('❌ Failed to unarchive invoice', 'error');
    }
  };

  const handleMarkPaid = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paid: !currentStatus }),
      });
  
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchInvoices(showArchived, selectedAssignee); // already declared in your file
      } else {
        addToast('Failed to update payment status', 'error');
      }
    } catch (err) {
      console.error('Error updating paid status:', err);
      addToast('Something went wrong.', 'error');
    }
  };

  const handleEditStart = (id, field, currentValue) => {
    setEditingField({ id, field });
    setEditValue(currentValue);
  };
  
  const handleEditSave = async () => {
    if (!editingField) return;
  
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${editingField.id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          field: editingField.field,
          value: editValue,
        }),
      });
  
      const data = await res.json();
      addToast(data.message);
      fetchInvoices(showArchived, selectedAssignee); // refresh data
      setEditingField(null);
      setEditValue('');
    } catch (err) {
      console.error('Edit failed:', err);
      addToast('Failed to update invoice.', 'error');
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
  
  const handleManualTagUpdate = async (id, tagsArray) => {
    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/update-tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tags: tagsArray }),
      });
  
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchInvoices(showArchived, selectedAssignee);
      } else {
        addToast('❌ Failed to update tags', 'error');
      }
    } catch (err) {
      console.error('Tag update error:', err);
      addToast('⚠️ Something went wrong.', 'error');
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
      addToast('⚠️ Failed to download invoice PDF', 'error');
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
        addToast('Failed to approve invoice', 'error');
      }
    } catch (err) {
      console.error('Approve error:', err);
      addToast('Failed to approve invoice', 'error');
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
        addToast('Failed to reject invoice', 'error');
      }
    } catch (err) {
      console.error('Reject error:', err);
      addToast('Failed to reject invoice', 'error');
    }
  };

  const handleAddComment = async (id) => {
    const text = commentInputs[id];
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
      a.download = 'archived_invoices.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export archived failed:', err);
      addToast('❌ Failed to export archived invoices', 'error');
    }
  };
  
  
  
  const totalInvoices = sortedInvoices.length;
  const totalAmount = sortedInvoices.reduce((sum, inv) => {
    const amount = parseFloat(inv.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0).toFixed(2);

  const visibleInvoices = invoices.filter(inv => {
    return selectedVendor === '' || inv.vendor === selectedVendor;
  });
  

  
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold mb-4">Login</h2>
          {loginError && <p className="text-red-600 mb-2">{loginError}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded"
          />
          <button onClick={handleLogin} className="btn btn-primary w-full">
            Log In
          </button>
        </div>
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
      {showTimeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded w-96">
            <h2 className="text-lg font-bold mb-2">Timeline for #{timelineInvoice}</h2>
            <ul className="text-sm max-h-60 overflow-y-auto">
              {timeline.map((t, i) => (
                <li key={i}>{new Date(t.created_at).toLocaleString()} - {t.action}</li>
              ))}
            </ul>
            <button onClick={() => setShowTimeline(false)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Close</button>
          </div>
        </div>
      )}
      <nav className="fixed top-0 left-0 right-0 bg-blue-700 dark:bg-blue-900 text-white shadow p-4 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">📄 Invoice Uploader AI</h1>
          <div className="flex items-center space-x-4">
            <TenantSwitcher tenant={tenant} onChange={setTenant} />
            <NotificationBell notifications={notifications} onOpen={markNotificationsRead} />
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="text-xl focus:outline-none"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {token && (
              <>
                <span className="text-sm">by Bini</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {isOffline && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center mt-20">
          Offline mode - changes will sync when you're online
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-24">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Invoice Uploader</h1>
          <LiveFeed token={token} tenant={tenant} />
        </div>
  
        {token ? (
          <>
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <div
                className={`border-2 border-dashed p-4 rounded cursor-pointer ${dragActive ? 'bg-blue-50' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current.click()}
              >
                <p className="text-sm text-gray-600">Drag & drop CSV/PDF here or click to select</p>
                <input
                  type="file"
                  multiple
                  accept=".csv,.pdf"
                  ref={fileInputRef}
                  disabled={!token}
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {filePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filePreviews.map((f, idx) => (
                    <div key={idx} className="border rounded p-2 text-xs">
                      <div className="font-semibold">{f.name}</div>
                      <div>Size: {(f.size / 1024).toFixed(1)} KB</div>
                      <div>Rows: {f.rows}</div>
                    </div>
                  ))}
                </div>
              )}

                        <button
                          onClick={handleExport}
                          disabled={!token}
                          className={`px-4 py-2 rounded text-sm ${
                            token
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Export Filtered Invoices
                        </button>

                        <input
                          type="text"
                          placeholder="🔍 Search tags, vendors, descriptions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          ref={searchInputRef}
                          className="border border-gray-300 rounded px-3 py-2 text-sm w-60"
                        />

                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={() => setShowArchived(!showArchived)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <span>Show Archived</span>
                        </label>

                        <select
                          value={selectedVendor}
                          onChange={(e) => setSelectedVendor(e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        >
                          <option value="">All Vendors</option>
                          {vendorList.map((vendor, idx) => (
                            <option key={idx} value={vendor}>
                              {vendor}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedAssignee}
                          onChange={(e) => setSelectedAssignee(e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        >
                          <option value="">All Assignees</option>
                          {[...new Set([...teamMembers, ...assigneeList])].map((person, idx) => (
                            <option key={idx} value={person}>
                              {person}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          placeholder="Min Amount"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-2 text-sm w-28"
                        />
                        <input
                          type="number"
                          placeholder="Max Amount"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-2 text-sm w-28"
                        />
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
              className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
            >
              Summarize Errors
            </button>
          </div>
        )}
                {aiSummary && (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded relative">
                  <strong>AI Suggestions:</strong>
                  <button
                    onClick={() => handleCopy(aiSummary)}
                    className="absolute top-2 right-2 text-xs text-blue-700 hover:underline"
                  >
                    Copy
                  </button>
                  <pre className="whitespace-pre-wrap">{aiSummary}</pre>
                </div>
              )}

                  {vendorSummary && (
                    <div className="mt-4 p-4 bg-purple-100 border border-purple-400 text-purple-800 rounded relative">
                      <strong>Vendor Insights:</strong>
                      <button
                        onClick={() => handleCopy(vendorSummary)}
                        className="absolute top-2 right-2 text-xs text-blue-700 hover:underline"
                      >
                        Copy
                      </button>
                      <pre className="whitespace-pre-wrap">{vendorSummary}</pre>
                    </div>
                  )}

                  {monthlyInsights && (
                    <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-800 rounded relative">
                      <strong>Monthly Insights:</strong>
                      <button
                        onClick={() => handleCopy(monthlyInsights.summary)}
                        className="absolute top-2 right-2 text-xs text-blue-700 hover:underline"
                      >
                        Copy
                      </button>
                      <table className="text-xs mb-2">
                        <thead>
                          <tr>
                            <th className="pr-4 text-left">Vendor</th>
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


                 {selectedInvoices.length > 0 && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                          <span className="text-blue-700 text-sm">
                            ✅ {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex space-x-2">
                            {!showArchived && (
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
                            {showArchived && (
                              <button
                                onClick={handleBulkUnarchive}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              >
                                Unarchive Selected
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                     {/* Upload/Export Action Buttons */}
                      <div className="flex flex-wrap justify-between items-center mt-6 mb-2 gap-2">
                        <div className="flex flex-wrap space-x-2">
                          {role === 'admin' && (
                            <button
                              onClick={handleUpload}
                              disabled={!token}
                              className="btn btn-primary text-sm flex items-center space-x-2 disabled:opacity-60"
                            >
                              {loading && (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              )}
                              <span>{loading ? 'Uploading...' : 'Upload CSV'}</span>
                            </button>
                          )}

                          <button
                            onClick={handleVendorSummary}
                            disabled={!token}
                            className="btn bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center space-x-2 disabled:opacity-60"
                          >
                            {loadingVendor && (
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            )}
                            <span>{loadingVendor ? 'Loading...' : 'Get Vendor Insights'}</span>
                          </button>

                          <button
                            onClick={handleMonthlyInsights}
                            disabled={!token}
                            className="btn btn-primary text-sm flex items-center space-x-2 disabled:opacity-60"
                          >
                            {loadingInsights && (
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            )}
                            <span>{loadingInsights ? 'Loading...' : '🧠 Monthly Insights'}</span>
                          </button>

                          <button
                            onClick={handleExportAll}
                            disabled={!token}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 text-sm disabled:opacity-60"
                          >
                            Export All as CSV
                          </button>
                          <button
                            onClick={handleExportDashboardPDF}
                            disabled={!token}
                            className="btn btn-primary bg-green-700 hover:bg-green-800 text-sm disabled:opacity-60"
                          >
                            Export Dashboard PDF
                          </button>

                          {role === 'admin' && (
                            <button
                              onClick={handleClearAll}
                              disabled={!token}
                              className="btn btn-danger text-sm disabled:opacity-60"
                            >
                              Clear All Invoices
                            </button>
                          )}
                          <button
                            onClick={handleResetFilters}
                            className="btn btn-secondary text-sm"
                          >
                            Reset Filters
                          </button>
                          <button
                            onClick={handleExportArchived}
                            className="btn bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                          >
                            Export Archived
                          </button>

                        </div>
                        <div className="flex flex-wrap space-x-2 mt-2 w-full">
                          <input
                            type="text"
                            value={chatQuestion}
                            onChange={(e) => setChatQuestion(e.target.value)}
                            placeholder="Ask AI about invoices..."
                            className="border rounded p-1 flex-1 text-sm"
                          />
                        <button
                            onClick={handleAssistantQuery}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Ask
                          </button>
                        </div>
                        <div className="flex flex-wrap space-x-2 mt-2 w-full">
                          <input
                            type="text"
                            value={chartQuestion}
                            onChange={(e) => setChartQuestion(e.target.value)}
                            placeholder="Ask for a chart..."
                            className="border rounded p-1 flex-1 text-sm"
                          />
                          <button
                            onClick={handleChartQuery}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Chart
                          </button>
                        </div>
                        {chatAnswer && (
                          <div className="mt-2 p-2 bg-gray-100 border rounded text-sm whitespace-pre-wrap w-full">
                            {chatAnswer}
                          </div>
                        )}
                        {chartDataAuto.length > 0 && (
                          <div className="w-full h-64 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartDataAuto}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={Object.keys(chartDataAuto[0])[0]} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey={Object.keys(chartDataAuto[0])[1]} fill="#10B981" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {vendorList.length > 0 && (
                          <div className="mb-4">
                            <label className="mr-2 font-medium">Filter by Vendor:</label>
                            <select
                              value={selectedVendor}
                              onChange={(e) => setSelectedVendor(e.target.value)}
                              className="border rounded p-1"
                            >
                              <option value="">All Vendors</option>
                              {vendorList.map((vendor, idx) => (
                                <option key={idx} value={vendor}>
                                  {vendor}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

             
                      <div className="flex justify-end mb-2 space-x-4">
                        <button
                          onClick={() => setShowChart(!showChart)}
                          className="text-sm text-blue-700 underline hover:text-blue-900"
                        >
                          {showChart ? 'Hide Chart' : 'Show Chart'}
                        </button>
                        {viewMode !== 'graph' && (
                          <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                            className="text-sm text-blue-700 underline hover:text-blue-900"
                          >
                            {viewMode === 'table' ? '📇 Card View' : '📊 Table View'}
                          </button>
                        )}
                        <button
                          onClick={() => setViewMode(viewMode === 'graph' ? 'table' : 'graph')}
                          className="text-sm text-blue-700 underline hover:text-blue-900"
                        >
                          {viewMode === 'graph' ? '📊 Table View' : '🕸 Graph View'}
                        </button>

                      </div>


                <h2 className="text-lg font-medium mt-8 mb-2 text-gray-800">
                  Invoice Totals by Vendor
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
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="vendor" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center my-4 space-x-2">
                        <label className="text-sm">Interval:</label>
                        <select
                          value={cashFlowInterval}
                          onChange={(e) => setCashFlowInterval(e.target.value)}
                          className="border rounded p-1 text-sm"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div className="h-64">
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
                      </div>

                      <h3 className="text-lg font-medium mt-8 mb-2 text-gray-800">Top 5 Vendors This Quarter</h3>
                      <div className="flex items-center my-2 space-x-2 text-sm">
                        <label>Filter:</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="border rounded p-1"
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
                            className="border rounded p-1"
                          />
                        )}
                        {filterType === 'date' && (
                          <>
                            <input
                              type="date"
                              value={filterStartDate}
                              onChange={(e) => setFilterStartDate(e.target.value)}
                              className="border rounded p-1"
                            />
                            <input
                              type="date"
                              value={filterEndDate}
                              onChange={(e) => setFilterEndDate(e.target.value)}
                              className="border rounded p-1"
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
                              className="border rounded p-1"
                            />
                            <input
                              type="number"
                              value={filterMaxAmount}
                              onChange={(e) => setFilterMaxAmount(e.target.value)}
                              placeholder="Max"
                              className="border rounded p-1"
                            />
                          </>
                        )}
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topVendors}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="vendor" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#6366F1" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <h3 className="text-lg font-medium mt-8 mb-2 text-gray-800">Spending by Tag</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={tagReport}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tag" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#0ea5e9" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      </>
                    )}
                <div className="flex justify-between items-center mt-6 mb-2 text-sm text-gray-700">
                  <span>Total Invoices: <strong>{totalInvoices}</strong></span>
                  <span>Total Amount: <strong>${totalAmount}</strong></span>
                </div>
                <div className="overflow-x-auto mt-6 max-h-[500px] overflow-y-auto rounded border">

                {viewMode !== 'graph' && (
                  viewMode === 'table' ? (
              <div className="overflow-x-auto mt-6 max-h-[500px] overflow-y-auto rounded border">      
              <table className="min-w-full bg-white border border-gray-300 text-sm">
              <thead className="bg-gray-200 text-gray-700 sticky top-0 z-10 shadow-sm">
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
                      Invoice #
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
                      Vendor
                      {sortConfig.key === 'vendor' && (
                        <span>{sortConfig.direction === 'asc' ? ' ⬆' : ' ⬇'}</span>
                      )}
                    </th>
                    <th className="border px-4 py-2">Created At</th>
                    <th className="border px-4 py-2">Assignee</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Updated At</th>
                    <th className="border px-4 py-2">Quality</th>
                    <th className="border px-4 py-2">Risk</th>
                    <th className="border px-4 py-2">Actions</th>
                    
                  </tr>
                </thead>

              <tbody>
              {loadingInvoices ? (
                <tr>
                  <td colSpan="7" className="py-6"><Skeleton rows={5} height="h-4" /></td>
                </tr>
              ) : sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500 italic">
                    💤 No invoices to display. Try uploading one or adjusting your filters.
                  </td>
                </tr>
              ) : (
                
                sortedInvoices.map((inv, idx) => (
                  <tr
                          key={inv.id}
                          className={`text-center hover:bg-gray-100 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } ${
                            inv.archived ? '!bg-gray-200 text-gray-500 italic' : ''
                          } ${
                            recentInvoices.includes(inv.id) ? 'bg-green-100 border-green-400' : ''
                          } ${
                            selectedVendor && inv.vendor === selectedVendor ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                        >
                    <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(inv.id)}
                        onChange={() => toggleSelectInvoice(inv.id)}
                      />
                    </td>
                    <td className="border px-4 py-2">{inv.id}</td>
                    <td className="border px-4 py-2">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{inv.invoice_number}</span>
                        <div className="flex space-x-1 mt-1">
                          {recentInvoices.includes(inv.id) && (
                            <span className="text-green-600 text-[10px] font-semibold">🆕 New</span>
                          )}
                          {inv.paid && (
                            <span className="text-green-600 text-[10px] font-semibold">✅ Paid</span>
                          )}
                          {inv.archived && (
                            <span className="text-gray-500 text-[10px] font-semibold">📦 Archived</span>
                          )}
                          {duplicateFlags[inv.id] && (
                            <span className="text-yellow-500 text-[10px] font-semibold">⚠️</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className="border px-4 py-2 cursor-pointer"
                      onClick={() => {
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
                          className="border px-1 text-sm w-full"
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
                      className="border px-4 py-2 cursor-pointer"
                      onClick={() => {
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
                      className="border px-4 py-2 cursor-pointer"
                      onClick={() => {
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
                          className="border px-1 text-sm w-full"
                          autoFocus
                        />
                        
                      ) : (
                        <>
                          {inv.vendor}
                          {updatedFields[`${inv.id}-vendor`] && (
                            <span className="ml-2 text-green-600 text-xs font-semibold">✅</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {inv.created_at ? new Date(inv.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="border px-4 py-2">
                      <select
                        value={inv.assignee || ''}
                        onChange={(e) => handleAssign(inv.id, e.target.value)}
                        className="border rounded px-1 text-sm"
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
                              <button
                                onClick={() => handleArchive(inv.id)}
                                className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 text-xs w-full"
                                title="Archive"
                              >
                                <ArchiveBoxIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}

                        <button
                            onClick={() => handleDownloadPDF(inv.id)}
                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs w-full"
                            title="Download PDF"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>

                      {inv.archived && (
                        <button
                          onClick={() => handleUnarchive(inv.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs w-full"
                          title="Unarchive"
                        >
                          <ArrowUturnUpIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleSuggestVendor(inv)}
                        className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 text-xs w-full"
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
                      {tagSuggestions[inv.id] && (
                        <div className="text-xs text-indigo-800 mt-1 text-center">
                          🏷️ {tagSuggestions[inv.id].join(', ')}
                        </div>
                      )}
                      <button
                        onClick={() => handleFlagSuspicious(inv)}
                        className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 text-xs w-full"
                        title="Flag"
                      >
                        <FlagIcon className="w-4 h-4" />
                      </button>
                        <button
                          onClick={() => handleViewTimeline(inv.id)}
                          className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs w-full"
                          title="Timeline"
                        >
                          <ClockIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePaymentRequest(inv.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs w-full"
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
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs w-full flex justify-center items-center space-x-1 disabled:opacity-50"
                          disabled={downloadingId === inv.id}
                        >
                        {downloadingId === inv.id ? (
                            <Spinner className="h-3 w-3" />
                          ) : (
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          )}
                      </button>

                      {vendorSuggestions[inv.id] && (
                        <div className="text-xs text-purple-800 mt-1 text-center">
                          💡 {vendorSuggestions[inv.id]}
                        </div>
                      )}
                      {suspicionFlags[inv.id] && (
                        <div className="text-xs text-yellow-800 mt-1 text-center">
                          🚩 {suspicionFlags[inv.id]}
                        </div>
                      )}
                     <input
                        type="text"
                        value={tagInputs[inv.id] || ''}
                        onChange={(e) =>
                          setTagInputs((prev) => ({ ...prev, [inv.id]: e.target.value }))
                        }
                        placeholder="Add tag"
                        className="text-xs p-1 border rounded w-full"
                      />
                      <button
                        onClick={() => handleAddTag(inv.id, tagInputs[inv.id])}
                        className="bg-green-600 text-white px-2 py-1 mt-1 rounded hover:bg-green-700 text-xs w-full"
                        title="Add Tag"
                      >
                        <PlusCircleIcon className="w-4 h-4" />
                      </button>
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
                  </tr>
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
                  ) : sortedInvoices.map((inv) => (
                    <div
                    key={inv.id}
                    className={`border rounded-lg p-4 shadow-sm flex flex-col space-y-2 ${
                      inv.archived ? 'bg-gray-100 text-gray-500 italic' : 'bg-white'
                    }`}
                  >
                  
                      <div className="text-sm font-semibold">#{inv.invoice_number} {duplicateFlags[inv.id] && <span className="text-yellow-500">⚠️</span>}</div>
                      <div className="text-sm">💰 {inv.amount}</div>
                      <div className="text-sm">📅 {new Date(inv.date).toLocaleDateString()}</div>
                      <div className="text-sm">🏢 {inv.vendor}</div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {inv.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: tagColors[tag] || '#6366f1' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                      {!inv.archived && (
                        <button
                          onClick={() => handleArchive(inv.id)}
                          className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                          title="Archive"
                        >
                          <ArchiveBoxIcon className="w-4 h-4" />
                        </button>
                      )}
                      {role === 'admin' && (
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                      {(role === 'approver' || role === 'admin') && (
                        <>
                          <button
                            onClick={() => handleApprove(inv.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            title="Approve"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(inv.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            title="Reject"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePaymentRequest(inv.id)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            disabled={paymentRequestId === inv.id}
                          >
                            {paymentRequestId === inv.id ? (
                              <Spinner className="h-3 w-3" />
                            ) : (
                              <CurrencyDollarIcon className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    <div className="text-xs mt-1">Status: {inv.approval_status || 'Pending'}</div>
                    <div className="mt-1 space-y-1">
                      {inv.comments?.map((c, i) => (
                        <div key={i} className="text-xs bg-gray-100 rounded p-1">{c.text}</div>
                      ))}
                      <div className="flex mt-1">
                        <input
                          type="text"
                          value={commentInputs[inv.id] || ''}
                          onChange={(e) => setCommentInputs((p) => ({ ...p, [inv.id]: e.target.value }))}
                          className="border rounded px-1 text-xs flex-1"
                          placeholder="Add comment"
                        />
                        <button
                          onClick={() => handleAddComment(inv.id)}
                          className="bg-blue-600 text-white text-xs px-2 py-1 ml-1 rounded"
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    </div>
                  ))}
                </div>

                ) : null)}
              
              {selectedInvoices.length > 0 && (
                  <div className="mt-4 flex space-x-2 justify-center bg-blue-50 p-3 rounded border border-blue-300">
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
                          ? 'bg-blue-600 text-white'
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
            🔒 Please log in to access invoice management tools.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;