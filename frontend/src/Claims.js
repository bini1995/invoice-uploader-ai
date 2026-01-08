import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE } from './api';
import ImprovedNavbar from './components/ImprovedNavbar';
import ImprovedSidebarNav from './components/ImprovedSidebarNav';
import Login from './Login';
import Spinner from './components/Spinner';
import Toast from './components/Toast';
import Skeleton from './components/Skeleton';
import EmptyState from './components/EmptyState';
import ConfirmModal from './components/ConfirmModal';
import ClaimDetailModal from './components/ClaimDetailModal';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FlagIcon,
  EyeIcon,
  TrashIcon,
  XCircleIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [notifications, setNotifications] = useState([]);
  const [tenant, setTenant] = useState('default');
  const [role, setRole] = useState('user');
  const [token, setToken] = useState(localStorage.getItem('token'));

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchClaims();
    fetchNotifications();
  }, [token, navigate]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/claims`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const normalizedClaims = Array.isArray(data) ? data : (data.claims || []);
        setClaims(normalizedClaims);
      } else {
        console.error('Failed to fetch claims');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClaimSelect = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleDeleteClaim = async (claimId) => {
    try {
      const response = await fetch(`${API_BASE}/api/claims/${claimId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setClaims(claims.filter(claim => claim.id !== claimId));
        setShowDeleteModal(false);
        setSelectedClaim(null);
      }
    } catch (error) {
      console.error('Error deleting claim:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'fraud_detected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      case 'fraud_detected': return <FlagIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.policyholder_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (!token) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ImprovedSidebarNav notifications={notifications} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64 min-w-0">
        {/* Header */}
        <div className="flex-shrink-0">
          <ImprovedNavbar
            tenant={tenant}
            onTenantChange={setTenant}
            notifications={notifications}
            role={role}
            token={token}
          />
        </div>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Claims Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and process insurance claims efficiently</p>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="fraud_detected">Fraud Detected</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at">Date Created</option>
                  <option value="claim_number">Claim Number</option>
                  <option value="estimated_value">Amount</option>
                  <option value="status">Status</option>
                </select>
                
                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  className="px-3 py-2"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            {/* Claims Table */}
            <Card className="overflow-hidden">
              {loading ? (
                <div className="p-6">
                  <Skeleton className="h-8 mb-4" />
                  <Skeleton className="h-8 mb-4" />
                  <Skeleton className="h-8 mb-4" />
                  <Skeleton className="h-8" />
                </div>
              ) : sortedClaims.length === 0 ? (
                <EmptyState
                  icon={ArchiveBoxIcon}
                  title="No claims found"
                  description="Get started by uploading your first claim document."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Claim Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Policyholder
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedClaims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {claim.claim_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {claim.policyholder_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${claim.estimated_value?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                              {getStatusIcon(claim.status)}
                              <span className="ml-1 capitalize">{claim.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(claim.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClaimSelect(claim)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showDetailModal && selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClaim(null);
          }}
          onUpdate={fetchClaims}
        />
      )}

      {showDeleteModal && selectedClaim && (
        <ConfirmModal
          title="Delete Claim"
          message={`Are you sure you want to delete claim ${selectedClaim.claim_number}? This action cannot be undone.`}
          onConfirm={() => handleDeleteClaim(selectedClaim.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedClaim(null);
          }}
        />
      )}
    </div>
  );
}

export default ClaimsPage;
