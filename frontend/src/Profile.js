import React, { useState, useEffect } from 'react';
import { Card } from './components/ui/Card';
import { API_BASE } from './api';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import PageHeader from './components/PageHeader';

export default function Profile({ addToast }) {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        localStorage.setItem('userName', data.name);
        addToast('Profile updated successfully!');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update profile');
        addToast('Failed to update profile', 'error');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Something went wrong');
      addToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      viewer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      broker: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      adjuster: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      medical_reviewer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      auditor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (loading) {
    return (
      <ImprovedMainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </ImprovedMainLayout>
    );
  }

  return (
    <ImprovedMainLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <PageHeader title="Profile Settings" subtitle="Manage your account information" />
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-6" role="alert">{error}</div>
        )}
        
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={profile?.email || profile?.username || ''}
                className="input w-full bg-gray-50 dark:bg-gray-700"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile?.role)}`}>
                  {profile?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Member Since
                </label>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDate(profile?.created_at)}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>
        
        <Card>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Security</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
              </div>
              <a href="/forgot-password" className="btn btn-secondary text-sm">
                Change Password
              </a>
            </div>
          </div>
        </Card>
      </div>
    </ImprovedMainLayout>
  );
}
