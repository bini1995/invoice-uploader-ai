import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TenantSwitcher from './TenantSwitcher';
import NotificationBell from './NotificationBell';
import LanguageSelector from './LanguageSelector';
import ThemePicker from './ThemePicker';
import { useTranslation } from 'react-i18next';
import {
  Bars3Icon,
  AdjustmentsHorizontalIcon,
  HomeIcon,
  DocumentChartBarIcon,
  ArchiveBoxIcon,
  ArrowUpTrayIcon,
  SunIcon,
  MoonIcon,
  UsersIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import HelpTooltip from './HelpTooltip';

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
  onUpload,
  search,
  onSearchChange,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const crumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((c) => c[0].toUpperCase() + c.slice(1));

  return (
    <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow z-20">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4 p-2">
        <div className="flex items-center space-x-2">
          <Link to="/invoices" className="flex items-center space-x-1" onClick={() => { setMenuOpen(false); setUserOpen(false); }}>
            <ArchiveBoxIcon className="h-5 w-5" />
            <span className="font-semibold text-sm">{t('title')}</span>
          </Link>
          {crumbs.length > 0 && (
            <span className="text-xs opacity-80">/ {crumbs.join(' / ')}</span>
          )}
        </div>
        <input
          id="searchInput"
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search..."
          className="input text-gray-800 dark:text-gray-100 h-7 text-sm"
        />
        <div className="flex items-center space-x-3 relative">
          <TenantSwitcher tenant={tenant} onChange={onTenantChange} />
          <LanguageSelector />
          <NotificationBell notifications={notifications} onOpen={onNotificationsOpen} />
          {token && (
            <button onClick={onUpload} className="btn btn-primary text-xs flex items-center space-x-1">
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Upload</span>
            </button>
          )}
          {token && (
            <button
              id="filterToggle"
              onClick={onToggleFilters}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
              title="Filters"
              aria-label="Toggle filters"
            >
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </button>
          )}
          {token && (
            <>
              <button
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
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
                  <Link
                    to="/board"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Squares2X2Icon className="h-5 w-5 mr-2" /> Board
                  </Link>
                  <Link
                    to="/fraud"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FlagIcon className="h-5 w-5 mr-2" /> Fraud
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
              <div className="relative" onMouseEnter={() => setHelpOpen(true)} onMouseLeave={() => setHelpOpen(false)}>
                <QuestionMarkCircleIcon className="h-6 w-6 cursor-help" />
                {helpOpen && <HelpTooltip topic="dashboard" token={token} />}
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                aria-label="Toggle dark mode"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>
              <ThemePicker darkMode={darkMode} setDarkMode={setDarkMode} />
              <div className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center space-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                  title="Account"
                  aria-label="Account"
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
