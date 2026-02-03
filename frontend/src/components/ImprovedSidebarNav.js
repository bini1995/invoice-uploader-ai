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
} from 'lucide-react';

export default function ImprovedSidebarNav({ notifications = [], collapsed = false }) {
  const location = useLocation();
  const [open, setOpen] = useState(!collapsed);
  
  useEffect(() => {
    if (collapsed) setOpen(false);
  }, [collapsed]);
  
  const unread = notifications.filter(n => !n.read).length;
  const role = localStorage.getItem('role') || '';

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
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="ClarifyOps" className="h-8 w-8" />
              <span className="font-bold text-lg">
                <span className="text-white">Clarify</span>
                <span className="text-blue-400">Ops</span>
              </span>
            </div>
          ) : (
            <img src="/logo.svg" alt="ClarifyOps" className="h-8 w-8" />
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
      </div>
    </aside>
  );
} 