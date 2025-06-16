import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
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
              className={`nav-link flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/dashboard' ? 'font-semibold' : ''}`}
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/analytics"
              className={`nav-link flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/analytics' ? 'font-semibold' : ''}`}
            >
              <DocumentChartBarIcon className="w-5 h-5 mr-2" />
              <span>Reports</span>
            </Link>
            <Link
              to="/builder"
              className={`nav-link flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/builder' ? 'font-semibold' : ''}`}
            >
              <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
              <span>Builder</span>
            </Link>
            <Link
              to="/settings"
              className={`nav-link flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/settings' ? 'font-semibold' : ''}`}
            >
              <Cog6ToothIcon className="w-5 h-5 mr-2" />
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
