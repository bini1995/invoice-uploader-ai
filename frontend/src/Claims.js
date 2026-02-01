import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { API_BASE } from './api';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import Spinner from './components/Spinner';
import EmptyState from './components/EmptyState';
import ConfirmModal from './components/ConfirmModal';
import ClaimDetailModal from './components/ClaimDetailModal';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [token] = useState(localStorage.getItem('token'));

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchClaims();
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
        const normalizedClaims = Array.isArray(data) ? data : (data.claims || data.invoices || []);
        setClaims(normalizedClaims);
      } else {
        console.error('Failed to fetch claims');
        setClaims([]);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setClaims([]);
    } finally {
      setLoading(false);
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
    if (!claim) return false;
    const claimNumber = claim.claim_number || claim.invoice_number || '';
    const policyholderName = claim.policyholder_name || claim.vendor || '';
    const matchesSearch = claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policyholderName.toLowerCase().includes(searchTerm.toLowerCase());
    const claimStatus = claim.status || 'pending';
    const matchesStatus = statusFilter === 'all' || claimStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ImprovedMainLayout title="Claims Management">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Claims Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and process insurance claims efficiently</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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

      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : sortedClaims.length === 0 ? (
          <EmptyState
            icon={<ClockIcon className="h-12 w-12" />}
            title="No claims found"
            description="Upload a claim document to get started"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Claim #
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
                {sortedClaims.map((claim) => {
                  const claimNumber = claim.claim_number || claim.invoice_number || 'N/A';
                  const policyholderName = claim.policyholder_name || claim.vendor || 'Unknown';
                  const estimatedValue = claim.estimated_value || claim.amount || 0;
                  const status = claim.status || 'pending';
                  const createdAt = claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'N/A';
                  
                  return (
                    <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {String(claimNumber)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {String(policyholderName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${typeof estimatedValue === 'number' ? estimatedValue.toLocaleString() : '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="ml-1 capitalize">{String(status).replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {String(createdAt)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showDetailModal && selectedClaim && (
        <ClaimDetailModal
          open={showDetailModal}
          invoice={selectedClaim}
          token={token}
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
          message={`Are you sure you want to delete claim ${selectedClaim.claim_number || selectedClaim.invoice_number || 'this claim'}? This action cannot be undone.`}
          onConfirm={() => handleDeleteClaim(selectedClaim.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedClaim(null);
          }}
        />
      )}
    </ImprovedMainLayout>
  );
}

export default ClaimsPage;
