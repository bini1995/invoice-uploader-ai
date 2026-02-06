import React, { useState, useEffect } from 'react';
import { API_BASE } from './api';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import {
  Webhook, Download, Key, RefreshCw, Trash2, Plus,
  CheckCircle, XCircle, Clock, Send, Copy, ExternalLink,
  FileSpreadsheet, FileText, Settings, Eye, EyeOff
} from 'lucide-react';

const EVENT_OPTIONS = [
  'claim.extracted',
  'claim.status_changed',
  'claim.approved',
  'claim.rejected',
  'claim.flagged',
  'document.uploaded',
  'document.processed',
];

export default function DeliverySettings() {
  const [activeTab, setActiveTab] = useState('webhooks');
  const [configs, setConfigs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: '',
    type: 'webhook',
    url: '',
    secret: '',
    events: ['claim.extracted', 'claim.status_changed'],
  });
  const [testResults, setTestResults] = useState({});
  const [copiedField, setCopiedField] = useState('');
  const [showSecrets, setShowSecrets] = useState({});
  const [exportLoading, setExportLoading] = useState({});
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    loadConfigs();
    loadLogs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/delivery/configs`, { headers });
      const data = await res.json();
      if (data.success) setConfigs(data.data || []);
    } catch (err) {
      console.error('Failed to load configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/logs?limit=50&offset=0`, { headers });
      const data = await res.json();
      if (data.success) setLogs(data.data || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const addConfig = async () => {
    if (!newConfig.name || !newConfig.url) return;
    try {
      const res = await fetch(`${API_BASE}/api/delivery/configs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newConfig.name,
          type: newConfig.type,
          config: {
            url: newConfig.url,
            secret: newConfig.secret,
            events: newConfig.events,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigs((prev) => [...prev, data.data]);
        setNewConfig({ name: '', type: 'webhook', url: '', secret: '', events: ['claim.extracted', 'claim.status_changed'] });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Failed to add config:', err);
    }
  };

  const deleteConfig = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/configs/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setConfigs((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete config:', err);
    }
  };

  const toggleActive = async (cfg) => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/configs/${cfg.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ active: !cfg.active }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigs((prev) =>
          prev.map((c) => (c.id === cfg.id ? { ...c, active: !c.active } : c))
        );
      }
    } catch (err) {
      console.error('Failed to toggle config:', err);
    }
  };

  const testConfig = async (id) => {
    setTestResults((prev) => ({ ...prev, [id]: { loading: true } }));
    try {
      const res = await fetch(`${API_BASE}/api/delivery/configs/${id}/test`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [id]: { loading: false, success: data.success, message: data.message || (data.success ? 'Connection successful' : 'Connection failed') },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [id]: { loading: false, success: false, message: 'Request failed' },
      }));
    }
  };

  const downloadExport = async (format) => {
    setExportLoading((prev) => ({ ...prev, [format]: true }));
    try {
      const endpoint = format === 'csv' ? '/api/v1/export/csv' : '/api/v1/export/excel';
      const res = await fetch(`${API_BASE}${endpoint}`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clarifyops-export.${format === 'csv' ? 'csv' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(`Failed to download ${format}:`, err);
    } finally {
      setExportLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const toggleSecretVisibility = (id) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEventSelection = (event) => {
    setNewConfig((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" /> Success
          </span>
        );
      case 'failed':
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case 'retrying':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <Clock className="w-3 h-3" /> Retrying
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
            <Clock className="w-3 h-3" /> {status || 'Unknown'}
          </span>
        );
    }
  };

  const tabs = [
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'logs', label: 'Delivery Logs', icon: Clock },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'api', label: 'API & Zapier', icon: Key },
  ];

  const renderWebhooksTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Webhook Configurations</h3>
          <p className="text-sm text-slate-400">Manage outbound webhook endpoints for event delivery</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h4 className="text-sm font-semibold text-white">New Webhook Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={newConfig.name}
                onChange={(e) => setNewConfig((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Production Webhook"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Endpoint URL</label>
              <input
                type="url"
                value={newConfig.url}
                onChange={(e) => setNewConfig((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://your-api.com/webhook"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Signing Secret (optional)</label>
            <input
              type="text"
              value={newConfig.secret}
              onChange={(e) => setNewConfig((p) => ({ ...p, secret: e.target.value }))}
              placeholder="whsec_..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Event Types</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map((event) => (
                <button
                  key={event}
                  onClick={() => toggleEventSelection(event)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    newConfig.events.includes(event)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={addConfig}
              disabled={!newConfig.name || !newConfig.url}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Webhook
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          <span className="ml-3 text-slate-400">Loading configurations...</span>
        </div>
      ) : configs.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Webhook className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No webhooks configured</h3>
          <p className="text-sm text-slate-400 mb-6">Add a webhook endpoint to start receiving event notifications</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Webhook
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map((cfg) => {
            const configData = cfg.config || {};
            const result = testResults[cfg.id];
            return (
              <div key={cfg.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-sm font-semibold text-white truncate">{cfg.name}</h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          cfg.active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-600/30 text-slate-400'
                        }`}
                      >
                        {cfg.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{configData.url || cfg.url || 'No URL configured'}</span>
                    </div>
                    {(configData.events || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(configData.events || []).map((event) => (
                          <span
                            key={event}
                            className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    )}
                    {result && !result.loading && (
                      <div
                        className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                          result.success
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {result.message}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => testConfig(cfg.id)}
                      disabled={result?.loading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      title="Test webhook"
                    >
                      {result?.loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Test
                    </button>
                    <button
                      onClick={() => toggleActive(cfg)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        cfg.active
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                      title={cfg.active ? 'Deactivate' : 'Activate'}
                    >
                      {cfg.active ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      {cfg.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteConfig(cfg.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Delivery Logs</h3>
          <p className="text-sm text-slate-400">Recent webhook delivery attempts and their status</p>
        </div>
        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No delivery logs yet</h3>
          <p className="text-sm text-slate-400">Logs will appear here once webhooks start firing</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Config</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Event</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Response</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-750 transition-colors">
                    <td className="px-5 py-3">{getStatusBadge(log.status)}</td>
                    <td className="px-5 py-3 text-sm text-slate-300">{log.config_name || log.configName || 'N/A'}</td>
                    <td className="px-5 py-3 text-sm text-slate-400 font-mono">{log.event_type || log.eventType || log.event || 'N/A'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-sm font-mono ${
                          log.response_code >= 200 && log.response_code < 300
                            ? 'text-green-400'
                            : log.response_code >= 400
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {log.response_code || log.responseCode || '--'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">
                      {log.created_at || log.createdAt
                        ? new Date(log.created_at || log.createdAt).toLocaleString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderExportTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Export Data</h3>
        <p className="text-sm text-slate-400">Download your claims and documents in common formats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">CSV Export</h4>
              <p className="text-xs text-slate-400">Comma-separated values for spreadsheets</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Download all processed claims data in CSV format. Compatible with Excel, Google Sheets, and most analytics tools.
          </p>
          <button
            onClick={() => downloadExport('csv')}
            disabled={exportLoading.csv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors w-full justify-center"
          >
            {exportLoading.csv ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download CSV
          </button>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Excel Export</h4>
              <p className="text-xs text-slate-400">Formatted spreadsheet with multiple sheets</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Download a formatted Excel workbook with structured data, formulas, and summary sheets for detailed analysis.
          </p>
          <button
            onClick={() => downloadExport('excel')}
            disabled={exportLoading.excel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors w-full justify-center"
          >
            {exportLoading.excel ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );

  const renderApiTab = () => {
    const apiKey = localStorage.getItem('apiKey') || '';
    const baseUrl = API_BASE || window.location.origin;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">API Access and Integrations</h3>
          <p className="text-sm text-slate-400">Connect ClarifyOps to your tools using the REST API or Zapier</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">API Key</h4>
              <p className="text-xs text-slate-400">Use this key to authenticate API requests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 font-mono text-sm text-slate-300 truncate">
              {apiKey ? (showSecrets['apiKey'] ? apiKey : apiKey.slice(0, 8) + '...' + apiKey.slice(-4)) : 'No API key found. Generate one from Settings.'}
            </div>
            {apiKey && (
              <>
                <button
                  onClick={() => toggleSecretVisibility('apiKey')}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                  title={showSecrets['apiKey'] ? 'Hide' : 'Show'}
                >
                  {showSecrets['apiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(apiKey, 'apiKey')}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                  title="Copy"
                >
                  {copiedField === 'apiKey' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Zapier Integration</h4>
              <p className="text-xs text-slate-400">Automate workflows with Zapier triggers</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Trigger URL - New Claim Extracted</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 font-mono text-xs text-slate-300 truncate">
                  {baseUrl}/api/v1/zapier/triggers/claim.extracted
                </div>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/zapier/triggers/claim.extracted`, 'zapier1')}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors flex-shrink-0"
                >
                  {copiedField === 'zapier1' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Trigger URL - Claim Status Changed</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 font-mono text-xs text-slate-300 truncate">
                  {baseUrl}/api/v1/zapier/triggers/claim.status_changed
                </div>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/zapier/triggers/claim.status_changed`, 'zapier2')}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors flex-shrink-0"
                >
                  {copiedField === 'zapier2' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Quick Start</h4>
              <p className="text-xs text-slate-400">Example API requests to get started</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">List Claims</label>
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-3">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
{`curl -X GET "${baseUrl}/api/claims" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Export CSV</label>
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-3">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
{`curl -X GET "${baseUrl}/api/v1/export/csv" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o export.csv`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'webhooks':
        return renderWebhooksTab();
      case 'logs':
        return renderLogsTab();
      case 'export':
        return renderExportTab();
      case 'api':
        return renderApiTab();
      default:
        return renderWebhooksTab();
    }
  };

  return (
    <ImprovedMainLayout title="Delivery Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Settings</h1>
          <p className="text-slate-400 mt-1">Configure webhooks, view delivery logs, export data, and manage API access</p>
        </div>

        <div className="border-b border-slate-700">
          <nav className="flex gap-1 -mb-px" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div>{renderContent()}</div>
      </div>
    </ImprovedMainLayout>
  );
}
