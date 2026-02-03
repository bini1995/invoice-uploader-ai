import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  BarChart2,
  FileSearch,
  Settings,
  Wrench,
  LayoutGrid,
  Archive,
  Flag,
  FileBarChart2,
  ChevronLeft,
  Menu,
  User,
  LogOut,
} from 'lucide-react';

export default function ImprovedSidebarNav({ notifications = [], collapsed = false }) {
  const location = useLocation();
  const [open, setOpen] = useState(!collapsed);
  
  useEffect(() => {
    if (collapsed) setOpen(false);
  }, [collapsed]);
  
  const unread = notifications.filter(n => !n.read).length;
  const role = localStorage.getItem('role') || '';
  const userName = localStorage.getItem('userName') || '';
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('username') || '';
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  const navItems = [
    {
      to: '/operations',
      icon: Home,
      label: 'Operations',
      description: 'Dashboard and overview'
    },
    {
      to: '/claims',
      icon: FileText,
      label: 'ClarifyClaims',
      description: 'Upload, validate, and summarize claims'
    },
    {
      to: '/analytics',
      icon: BarChart2,
      label: 'AI Spend Analytics',
      description: 'Analytics and insights'
    },
    {
      to: '/vendors',
      icon: Users,
      label: 'Vendors',
      description: 'Vendor management'
    },
    {
      to: '/auditflow',
      icon: Flag,
      label: 'AuditFlow',
      description: 'Risk and audit review'
    },
    {
      to: '/review',
      icon: FileSearch,
      label: 'Review',
      description: 'Human review queue'
    },
    {
      to: '/archive',
      icon: Archive,
      label: 'Archive',
      description: 'Archived documents'
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings',
      description: 'Account and preferences'
    }
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 z-30 transition-all duration-300 ${
        open ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4 space-y-4">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between mb-6">
          {open ? (
            <img src="/logo.png" alt="ClarifyOps" className="h-10 w-auto" />
          ) : (
            <img src="/logo.png" alt="ClarifyOps" className="h-8 w-auto" />
          )}
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/20 hover:bg-blue-600/40 transition-colors text-blue-400"
            aria-label="Toggle sidebar"
          >
            {open ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                title={open ? undefined : item.description}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${open ? 'mr-3' : ''}`} />
                {open && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Notifications badge */}
        {unread > 0 && (
          <div className={`flex items-center px-3 py-2 ${open ? 'justify-between' : 'justify-center'}`}>
            {open && <span className="text-xs text-indigo-200">Notifications</span>}
            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unread}
            </span>
          </div>
        )}
        
        {/* User Profile Section */}
        <div className="mt-auto pt-4 border-t border-slate-700/50">
          <Link
            to="/profile"
            className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-300 hover:bg-slate-700/50 hover:text-white ${
              location.pathname === '/profile' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' : ''
            }`}
            title={open ? undefined : 'Profile'}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(userName)}
            </div>
            {open && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{userEmail}</p>
              </div>
            )}
          </Link>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2.5 mt-2 rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-500/20 hover:text-red-400`}
            title={open ? undefined : 'Log out'}
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 ${open ? 'mr-3' : ''}`} />
            {open && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
} 