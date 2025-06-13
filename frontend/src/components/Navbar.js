import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TenantSwitcher from './TenantSwitcher';
import NotificationBell from './NotificationBell';
import {
  Bars3Icon,
  AdjustmentsHorizontalIcon,
  HomeIcon,
  DocumentChartBarIcon,
  ArchiveBoxIcon,
  UsersIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

export default function Navbar({
  tenant,
  onTenantChange,
  notifications = [],
  onNotificationsOpen,
  role,
  onLogout,
  darkMode,
  setDarkMode,
  token,
  onToggleFilters,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow z-20">
      <div className="max-w-4xl mx-auto flex justify-between items-center p-2">
        <Link to="/invoices" className="flex items-center space-x-1" onClick={() => { setMenuOpen(false); setUserOpen(false); }}>
          <ArchiveBoxIcon className="h-5 w-5" />
          <span className="font-semibold text-sm">Invoice Uploader</span>
        </Link>
        <div className="flex items-center space-x-3 relative">
          <TenantSwitcher tenant={tenant} onChange={onTenantChange} />
          <NotificationBell notifications={notifications} onOpen={onNotificationsOpen} />
          {token && (
            <button
              onClick={onToggleFilters}
              className="focus:outline-none"
              title="Filters"
            >
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </button>
          )}
          {token && (
            <>
              <button
                className="focus:outline-none"
                onClick={() => setMenuOpen((o) => !o)}
                title="Menu"
                aria-label="Menu"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              {menuOpen && (
                <div className="absolute right-12 top-8 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded shadow-lg w-40">
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HomeIcon className="h-5 w-5 mr-2" /> Dashboard
                  </Link>
                  <Link
                    to="/analytics"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <DocumentChartBarIcon className="h-5 w-5 mr-2" /> Analytics
                  </Link>
                  <Link
                    to="/vendors"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UsersIcon className="h-5 w-5 mr-2" /> Vendors
                  </Link>
                  <Link
                    to="/archive"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ArchiveBoxIcon className="h-5 w-5 mr-2" /> Archive
                  </Link>
                  {role === 'admin' && (
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      <UsersIcon className="h-5 w-5 mr-2" /> Settings
                    </Link>
                  )}
                </div>
              )}
              <button
                onClick={() => setDarkMode((d) => !d)}
                className={`focus:outline-none transform transition-transform duration-300 ${darkMode ? 'rotate-180' : ''}`}
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center space-x-1 focus:outline-none"
                  title="Account"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-sm">Bini</span>
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded shadow-lg">
                    <button
                      onClick={onLogout}
                      className="block px-4 py-2 text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
