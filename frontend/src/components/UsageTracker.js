import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  CpuChipIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { API_BASE } from '../api';

const ACTION_ICONS = {
  claims_uploads: DocumentArrowUpIcon,
  extractions: CpuChipIcon,
  csv_exports: ArrowDownTrayIcon
};

const ACTION_LABELS = {
  claims_uploads: 'Claims Uploads',
  extractions: 'AI Extractions',
  csv_exports: 'CSV Exports'
};

const ACTION_COLORS = {
  claims_uploads: 'bg-blue-500',
  extractions: 'bg-purple-500',
  csv_exports: 'bg-green-500'
};

export default function UsageTracker({ className = '' }) {
  const [usageStats, setUsageStats] = useState(null);
  const [usageLimits, setUsageLimits] = useState(null);
  const [usageTrends, setUsageTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (!token) return;
    fetchUsageData();
  }, [token, selectedPeriod]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, limitsRes, trendsRes] = await Promise.all([
        fetch(`${API_BASE}/api/usage/stats?period=${selectedPeriod}`, { headers }),
        fetch(`${API_BASE}/api/usage/limits`, { headers }),
        fetch(`${API_BASE}/api/usage/trends?period=last_6_months`, { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setUsageStats(statsData.data);
      }

      if (limitsRes.ok) {
        const limitsData = await limitsRes.json();
        setUsageLimits(limitsData.data);
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setUsageTrends(trendsData.data);
      }

    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (action) => {
    if (!usageStats || !usageStats[action]) return 0;
    const stat = usageStats[action];
    if (stat.limit <= 0) return 0;
    return Math.round((stat.total / stat.limit) * 100);
  };

  const getUsageColor = (action) => {
    const percentage = getUsagePercentage(action);
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (action) => {
    const percentage = getUsagePercentage(action);
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-600">
          <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Usage Statistics
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="current_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
            </select>
            
            {usageLimits && (
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <InformationCircleIcon className="w-4 h-4" />
                <span>{usageLimits.planType} Plan</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-6">
        {usageStats && Object.keys(usageStats).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(usageStats).map(([action, stat]) => {
              const Icon = ACTION_ICONS[action];
              const percentage = getUsagePercentage(action);
              const isUnlimited = stat.limit === -1;
              
              return (
                <motion.div
                  key={action}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${ACTION_COLORS[action]} bg-opacity-10`}>
                        <Icon className={`w-5 h-5 ${ACTION_COLORS[action].replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {ACTION_LABELS[action]}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {stat.total} used
                          {!isUnlimited && ` / ${stat.limit} limit`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getUsageColor(action)}`}>
                        {isUnlimited ? '∞' : `${percentage}%`}
                      </div>
                      {!isUnlimited && stat.remaining > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {stat.remaining} remaining
                        </div>
                      )}
                    </div>
                  </div>

                  {!isUnlimited && (
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(action)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  )}

                  {percentage >= 90 && !isUnlimited && (
                    <div className="mt-2 flex items-center space-x-1 text-sm text-red-600">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>Approaching limit</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No usage data available</p>
          </div>
        )}

        {/* Usage Trends */}
        {usageTrends && Object.keys(usageTrends).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Usage Trends (Last 6 Months)
            </h4>
            <div className="space-y-2">
              {Object.entries(usageTrends).slice(-3).map(([month, actions]) => (
                <div key={month} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex space-x-4">
                    {Object.entries(actions).map(([action, count]) => (
                      <span key={action} className="text-gray-700 dark:text-gray-300">
                        {ACTION_LABELS[action]}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Usage resets monthly
          </span>
          <button
            onClick={fetchUsageData}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
} 