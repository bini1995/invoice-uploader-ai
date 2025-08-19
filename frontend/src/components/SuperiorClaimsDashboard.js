import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export default function SuperiorClaimsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTenant, setSelectedTenant] = useState('default');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedTenant]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/superior/analytics/dashboard?time_range=${timeRange}`, {
        headers: {
          'X-Tenant-Id': selectedTenant,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? (
                <TrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  const FraudRiskCard = ({ data }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fraud Risk Analysis</h3>
        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Critical Risk Claims</span>
          <span className="text-lg font-semibold text-red-600">{data?.criticalRisk || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">High Risk Claims</span>
          <span className="text-lg font-semibold text-orange-600">{data?.highRisk || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Average Fraud Score</span>
          <span className="text-lg font-semibold text-blue-600">{(data?.avgFraudScore || 0).toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );

  const PerformanceMetrics = ({ data }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{(data?.cycleTime || 0).toFixed(1)}h</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Cycle Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{(data?.npsScore || 0).toFixed(0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">NPS Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{(data?.leakageRate || 0).toFixed(2)}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Leakage Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{(data?.complaintRate || 0).toFixed(2)}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Complaint Rate</div>
        </div>
      </div>
    </motion.div>
  );

  const ClaimsTrendChart = ({ data }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Claims Volume Trend</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data?.claimsTrend || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="claims" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.3} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );

  const FraudDetectionChart = ({ data }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fraud Detection Performance</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data?.fraudDetection || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="pattern" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="detected" fill="#10B981" />
          <Bar dataKey="missed" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );

  const RecentActivity = ({ data }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {(data?.recentActivity || []).map((activity, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              activity.type === 'claim_created' ? 'bg-green-500' :
              activity.type === 'fraud_detected' ? 'bg-red-500' :
              'bg-blue-500'
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Superior Claims Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights and advanced analytics for superior claims management
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Claims"
          value={dashboardData?.totalClaims || 0}
          change={dashboardData?.claimsChange || 0}
          icon={DocumentTextIcon}
          color="blue"
        />
        <StatCard
          title="Total Value"
          value={`$${(dashboardData?.totalValue || 0).toLocaleString()}`}
          change={dashboardData?.valueChange || 0}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <StatCard
          title="Avg Cycle Time"
          value={`${(dashboardData?.avgCycleTime || 0).toFixed(1)}h`}
          change={dashboardData?.cycleTimeChange || 0}
          icon={ClockIcon}
          color="purple"
        />
        <StatCard
          title="Fraud Score"
          value={(dashboardData?.avgFraudScore || 0).toFixed(2)}
          change={dashboardData?.fraudScoreChange || 0}
          icon={ShieldCheckIcon}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClaimsTrendChart data={dashboardData} />
        <FraudDetectionChart data={dashboardData} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FraudRiskCard data={dashboardData} />
        <PerformanceMetrics data={dashboardData} />
        <RecentActivity data={dashboardData} />
      </div>
    </div>
  );
} 