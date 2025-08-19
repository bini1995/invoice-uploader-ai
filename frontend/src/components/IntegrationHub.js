import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  GlobeAltIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const INTEGRATION_TYPES = {
  crm: {
    name: 'CRM Systems',
    icon: BuildingOfficeIcon,
    color: 'bg-blue-500',
    description: 'Connect with Salesforce, HubSpot, Pipedrive',
    providers: [
      { id: 'salesforce', name: 'Salesforce', logo: '🟦' },
      { id: 'hubspot', name: 'HubSpot', logo: '🟧' },
      { id: 'pipedrive', name: 'Pipedrive', logo: '🟥' },
      { id: 'zoho', name: 'Zoho CRM', logo: '🟪' }
    ]
  },
  erp: {
    name: 'ERP Systems',
    icon: CogIcon,
    color: 'bg-green-500',
    description: 'Integrate with SAP, Oracle, NetSuite',
    providers: [
      { id: 'sap', name: 'SAP', logo: '🟦' },
      { id: 'oracle', name: 'Oracle', logo: '🟥' },
      { id: 'netsuite', name: 'NetSuite', logo: '🟨' },
      { id: 'microsoft_dynamics', name: 'Microsoft Dynamics', logo: '🟦' }
    ]
  },
  payment: {
    name: 'Payment Processors',
    icon: CreditCardIcon,
    color: 'bg-purple-500',
    description: 'Connect with Stripe, PayPal, Square',
    providers: [
      { id: 'stripe', name: 'Stripe', logo: '🟪' },
      { id: 'paypal', name: 'PayPal', logo: '🟦' },
      { id: 'square', name: 'Square', logo: '🟩' },
      { id: 'adyen', name: 'Adyen', logo: '🟦' }
    ]
  },
  communication: {
    name: 'Communication',
    icon: GlobeAltIcon,
    color: 'bg-indigo-500',
    description: 'Email, SMS, Slack integrations',
    providers: [
      { id: 'sendgrid', name: 'SendGrid', logo: '🟦' },
      { id: 'twilio', name: 'Twilio', logo: '🟥' },
      { id: 'slack', name: 'Slack', logo: '🟪' },
      { id: 'microsoft_teams', name: 'Microsoft Teams', logo: '🟦' }
    ]
  },
  analytics: {
    name: 'Analytics & BI',
    icon: ChartBarIcon,
    color: 'bg-orange-500',
    description: 'Connect with Tableau, Power BI, Looker',
    providers: [
      { id: 'tableau', name: 'Tableau', logo: '🟦' },
      { id: 'powerbi', name: 'Power BI', logo: '🟨' },
      { id: 'looker', name: 'Looker', logo: '🟦' },
      { id: 'google_analytics', name: 'Google Analytics', logo: '🟦' }
    ]
  },
  security: {
    name: 'Security & Compliance',
    icon: ShieldCheckIcon,
    color: 'bg-red-500',
    description: 'Identity providers, compliance tools',
    providers: [
      { id: 'okta', name: 'Okta', logo: '🟦' },
      { id: 'auth0', name: 'Auth0', logo: '🟦' },
      { id: 'onelogin', name: 'OneLogin', logo: '🟦' },
      { id: 'duo', name: 'Duo Security', logo: '🟦' }
    ]
  }
};

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [connectionData, setConnectionData] = useState({});
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/superior/integrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Id': 'default'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (provider) => {
    setSelectedProvider(provider);
    setConnectionData({
      name: provider.name,
      provider: provider.id,
      apiKey: '',
      apiSecret: '',
      webhookUrl: '',
      environment: 'production'
    });
    setShowConnectModal(true);
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch('/api/superior/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Id': 'default'
        },
        body: JSON.stringify(connectionData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.success ? 'Connection successful!' : 'Connection failed: ' + result.error);
      }
    } catch (error) {
      alert('Connection test failed: ' + error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const saveIntegration = async () => {
    try {
      const response = await fetch('/api/superior/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Id': 'default'
        },
        body: JSON.stringify(connectionData)
      });

      if (response.ok) {
        const result = await response.json();
        setIntegrations(prev => [...prev, result.data]);
        setShowConnectModal(false);
        setSelectedProvider(null);
        setConnectionData({});
        alert('Integration saved successfully!');
      }
    } catch (error) {
      alert('Failed to save integration: ' + error.message);
    }
  };

  const deleteIntegration = async (integrationId) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      const response = await fetch(`/api/superior/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Id': 'default'
        }
      });

      if (response.ok) {
        setIntegrations(prev => prev.filter(i => i.id !== integrationId));
        alert('Integration deleted successfully!');
      }
    } catch (error) {
      alert('Failed to delete integration: ' + error.message);
    }
  };

  const toggleIntegration = async (integrationId, enabled) => {
    try {
      const response = await fetch(`/api/superior/integrations/${integrationId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Id': 'default'
        },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        setIntegrations(prev => 
          prev.map(i => i.id === integrationId ? { ...i, is_active: enabled } : i)
        );
      }
    } catch (error) {
      alert('Failed to toggle integration: ' + error.message);
    }
  };

  const IntegrationCard = ({ integration }) => {
    const type = INTEGRATION_TYPES[integration.type];
    const provider = type?.providers.find(p => p.id === integration.provider);
    const Icon = type?.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${type?.color} p-2 rounded-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {integration.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {provider?.name} • {type?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleIntegration(integration.id, !integration.is_active)}
              className={`px-3 py-1 rounded text-sm ${
                integration.is_active 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {integration.is_active ? 'Active' : 'Inactive'}
            </button>
            <button
              onClick={() => deleteIntegration(integration.id)}
              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`flex items-center ${
              integration.status === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {integration.status === 'connected' ? (
                <CheckCircleIcon className="w-4 h-4 mr-1" />
              ) : (
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              )}
              {integration.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
            <span className="text-gray-900 dark:text-white">
              {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
            <span className="text-gray-900 dark:text-white">
              {integration.data_points || 0}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {/* View logs */}}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Logs
            </button>
            <button
              onClick={() => {/* Sync now */}}
              className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              Sync Now
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const ConnectModal = () => (
    <AnimatePresence>
      {showConnectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Connect {selectedProvider?.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Integration Name</label>
                <input
                  type="text"
                  value={connectionData.name}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <input
                  type="password"
                  value={connectionData.apiKey}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">API Secret</label>
                <input
                  type="password"
                  value={connectionData.apiSecret}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, apiSecret: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Webhook URL (Optional)</label>
                <input
                  type="url"
                  value={connectionData.webhookUrl}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Environment</label>
                <select
                  value={connectionData.environment}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, environment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox</option>
                  <option value="test">Test</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={testConnection}
                disabled={testingConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={saveIntegration}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Integration
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integration Hub</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect your claims platform with external systems and services
          </p>
        </div>
        
        <button
          onClick={() => setSelectedType(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2 inline" />
          Add Integration
        </button>
      </div>

      {/* Integration Types Grid */}
      {!selectedType && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(INTEGRATION_TYPES).map(([key, type]) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedType(key)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`${type.color} p-3 rounded-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {type.providers.slice(0, 3).map(provider => (
                    <div key={provider.id} className="flex items-center space-x-2 text-sm">
                      <span className="text-2xl">{provider.logo}</span>
                      <span className="text-gray-700 dark:text-gray-300">{provider.name}</span>
                    </div>
                  ))}
                  {type.providers.length > 3 && (
                    <p className="text-sm text-gray-500">+{type.providers.length - 3} more</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Provider Selection */}
      {selectedType && !showConnectModal && (
        <div>
          <button
            onClick={() => setSelectedType(null)}
            className="mb-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Integration Types
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {INTEGRATION_TYPES[selectedType].name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATION_TYPES[selectedType].providers.map(provider => (
              <div
                key={provider.id}
                onClick={() => handleConnect(provider)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{provider.logo}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to connect
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Integrations */}
      {integrations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Active Integrations ({integrations.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </div>
      )}

      <ConnectModal />
    </div>
  );
} 