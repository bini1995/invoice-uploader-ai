import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TenantSwitcher from './TenantSwitcher';
import NotificationBell from './NotificationBell';
import LanguageSelector from './LanguageSelector';
import ThemePicker from './ThemePicker';
import DarkModeToggle from './DarkModeToggle';
import HighContrastToggle from './HighContrastToggle';
import useDarkMode from '../hooks/useDarkMode';
import useOutsideClick from '../hooks/useOutsideClick';
import { useTranslation } from 'react-i18next';
import {
  Bars3Icon,
  AdjustmentsHorizontalIcon,
  HomeIcon,
  DocumentChartBarIcon,
  ArchiveBoxIcon,
  ArrowUpTrayIcon,
  UsersIcon,
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
  token,
  onToggleFilters,
  onUpload,
  search,
  onSearchChange,
  smartQuery,
  onSmartQueryChange,
  onSmartSearch,
  onStartTour,
  activeFilterCount = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [darkMode, setDarkMode] = useDarkMode();
  const [tenantName, setTenantName] = useState(tenant);
  const menuRef = useRef(null);
  const userRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false));
  useOutsideClick(userRef, () => setUserOpen(false));
  const { t } = useTranslation();
  const location = useLocation();

  const crumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((c) => c[0].toUpperCase() + c.slice(1));

  useEffect(() => {
    if (!token) return;
    fetch(`/api/tenants/${tenant}/info`, { headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenant } })
      .then(r => r.ok ? r.json() : { name: tenant })
      .then(d => setTenantName(d.name || tenant))
      .catch(() => setTenantName(tenant));
  }, [tenant, token]);

  return (
    <nav className="sticky top-0 z-30 bg-indigo-700/60 dark:bg-indigo-900/60 backdrop-blur text-white shadow">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4 p-2">
        <div className="flex items-center space-x-2">
          <Link to="/claims" className="flex items-center space-x-1" onClick={() => { setMenuOpen(false); setUserOpen(false); }}>
            <img
              src="/logo.png"
              alt="logo"
              className="h-5 w-5"
            />
            <span className="font-semibold text-sm">{t('title')}</span>
            <span className="ml-1 text-xs opacity-80">{tenantName}</span>
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
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="input text-gray-800 dark:text-gray-100 h-7 text-sm"
        />
        <input
          id="smartSearchInput"
          type="text"
          value={smartQuery}
          onChange={(e) => onSmartQueryChange?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSmartSearch?.()}
          placeholder="Claim Documents from Amazon last quarter > $1,000"
          aria-label="Smart search"
          className="input text-gray-800 dark:text-gray-100 h-7 text-sm w-52"
        />
        <div className="flex items-center space-x-3 relative">
          <TenantSwitcher tenant={tenant} onChange={onTenantChange} />
          <LanguageSelector />
          <NotificationBell notifications={notifications} onOpen={onNotificationsOpen} />
          {token && (
            <button onClick={onUpload} className="btn btn-primary text-xs flex items-center space-x-1">
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>{t('upload')}</span>
            </button>
          )}
          {token && onToggleFilters && (
            <button
              id="filterToggle"
              onClick={onToggleFilters}
              className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
              title="Filters"
              aria-label="Toggle filters"
            >
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-4 w-4 text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
          {token && (
            <>
              <div className="relative" ref={menuRef}>
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
                      to="/operations"
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      <HomeIcon className="h-5 w-5 mr-2" /> Operations Dashboard
                    </Link>
                    <Link
                      to="/analytics"
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      <DocumentChartBarIcon className="h-5 w-5 mr-2" /> AI Spend Analytics Hub
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
              </div>
              <div
                className="relative"
                onMouseEnter={() => setHelpOpen(true)}
                onMouseLeave={() => setHelpOpen(false)}
              >
              <QuestionMarkCircleIcon className="h-6 w-6 cursor-help" />
              {helpOpen && <HelpTooltip topic="dashboard" token={token} />}
            </div>
            <HighContrastToggle />
            <DarkModeToggle />
            <ThemePicker darkMode={darkMode} setDarkMode={setDarkMode} tenant={tenant} />
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center space-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                  title="Account"
                  aria-label="Account"
                >
                  <img
                    src="https://api.dicebear.com/7.x/initials/svg?seed=bini&backgroundColor=5B21B6&textColor=ffffff"
                    alt="avatar"
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="text-sm">Bini</span>
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded shadow-lg">
                    {onStartTour && (
                      <button
                        onClick={() => { onStartTour(); setUserOpen(false); }}
                        className="block px-4 py-2 text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Start Tour
                      </button>
                    )}
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
