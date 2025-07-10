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
  Inbox,
  FileBarChart2,
  ChevronLeft,
  Menu,
} from 'lucide-react';

export default function SidebarNav({ notifications = [], collapsed = false }) {
  const location = useLocation();
  const [open, setOpen] = useState(!collapsed);
  useEffect(() => {
    if (collapsed) setOpen(false);
  }, [collapsed]);
  const unread = notifications.filter(n => !n.read).length;
  const role = localStorage.getItem('role') || '';

  return (
    <aside
      className={`hidden sm:block fixed left-0 top-12 h-[calc(100vh-3rem)] overflow-y-auto bg-indigo-700 dark:bg-indigo-900 shadow-lg border-r z-20 ${open ? 'w-64' : 'w-16'} p-4 space-y-2 transition-all`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Toggle sidebar"
      >
        {open ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
        {open && (
          <nav className="space-y-1 text-sm">
            <Link
              to="/dashboard"
              className={`nav-link border-l-4 ${location.pathname === '/dashboard' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/adaptive"
              className={`nav-link border-l-4 ${location.pathname === '/adaptive' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <BarChart2 className="w-5 h-5" />
              <span>Adaptive</span>
            </Link>
            <Link
              to="/invoices"
              className={`nav-link border-l-4 ${location.pathname === '/invoices' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <FileText className="w-5 h-5" />
              <span>Invoices</span>
            </Link>
            <Link
              to="/inbox"
              className={`nav-link border-l-4 ${location.pathname === '/inbox' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <Inbox className="w-5 h-5" />
              <span>Inbox</span>
            </Link>
            <Link
              to="/vendors"
              className={`nav-link border-l-4 ${location.pathname === '/vendors' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <Users className="w-5 h-5" />
              <span>Vendors</span>
            </Link>
            <Link
              to="/analytics"
              className={`nav-link border-l-4 ${location.pathname === '/analytics' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <BarChart2 className="w-5 h-5" />
              <span>AI Spend Analytics Hub</span>
            </Link>
            <Link
              to="/audit"
              className={`nav-link border-l-4 ${location.pathname === '/audit' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <FileSearch className="w-5 h-5" />
              <span>Audit</span>
            </Link>
            <Link
              to="/builder"
              className={`nav-link border-l-4 ${location.pathname === '/builder' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <Wrench className="w-5 h-5" />
              <span>Builder</span>
            </Link>
            <Link
              to="/export-builder"
              className={`nav-link border-l-4 ${location.pathname === '/export-builder' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <FileBarChart2 className="w-5 h-5" />
              <span>Exports</span>
            </Link>
            <Link
              to="/board"
              className={`nav-link border-l-4 ${location.pathname === '/board' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>Board</span>
            </Link>
            <Link
              to="/fraud"
              className={`nav-link border-l-4 ${location.pathname === '/fraud' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <Flag className="w-5 h-5" />
              <span>Fraud</span>
            </Link>
            <Link
              to="/archive"
              className={`nav-link border-l-4 ${location.pathname === '/archive' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
            >
              <Archive className="w-5 h-5" />
              <span>Archive</span>
            </Link>
            {role === 'admin' && (
              <Link
                to="/settings"
                className={`nav-link border-l-4 ${location.pathname === '/settings' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700 border-indigo-500' : 'border-transparent'}`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            )}
          </nav>
        )}
      <div className="mt-4 relative">
        <button
          className="focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Notifications"
        >
          🔔
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">
              {unread}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
