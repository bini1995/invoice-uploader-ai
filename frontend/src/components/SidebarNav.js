import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentIcon,
  UsersIcon,
  DocumentChartBarIcon,
  DocumentMagnifyingGlassIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  Squares2X2Icon,
  ArchiveBoxIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

export default function SidebarNav({ notifications = [] }) {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <aside className="hidden sm:block bg-white dark:bg-gray-800 shadow-lg w-64 p-4 space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-expanded={open}
      >
        Menu
      </button>
        {open && (
          <nav className="space-y-1 text-sm">
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === '/dashboard' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/invoices"
              className={`nav-link ${location.pathname === '/invoices' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <DocumentIcon className="w-5 h-5" />
              <span>Invoices</span>
            </Link>
            <Link
              to="/vendors"
              className={`nav-link ${location.pathname === '/vendors' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <UsersIcon className="w-5 h-5" />
              <span>Vendors</span>
            </Link>
            <Link
              to="/analytics"
              className={`nav-link ${location.pathname === '/analytics' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <DocumentChartBarIcon className="w-5 h-5" />
              <span>Reports</span>
            </Link>
            <Link
              to="/audit"
              className={`nav-link ${location.pathname === '/audit' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <DocumentMagnifyingGlassIcon className="w-5 h-5" />
              <span>Audit</span>
            </Link>
            <Link
              to="/builder"
              className={`nav-link ${location.pathname === '/builder' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <WrenchScrewdriverIcon className="w-5 h-5" />
              <span>Builder</span>
            </Link>
            <Link
              to="/board"
              className={`nav-link ${location.pathname === '/board' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <Squares2X2Icon className="w-5 h-5" />
              <span>Board</span>
            </Link>
            <Link
              to="/fraud"
              className={`nav-link ${location.pathname === '/fraud' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <FlagIcon className="w-5 h-5" />
              <span>Fraud</span>
            </Link>
            <Link
              to="/archive"
              className={`nav-link ${location.pathname === '/archive' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <ArchiveBoxIcon className="w-5 h-5" />
              <span>Archive</span>
            </Link>
            <Link
              to="/settings"
              className={`nav-link ${location.pathname === '/settings' ? 'font-semibold bg-indigo-100 dark:bg-indigo-700' : ''}`}
            >
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Settings</span>
            </Link>
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
