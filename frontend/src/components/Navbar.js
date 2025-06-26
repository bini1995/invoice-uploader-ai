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
  token,
  onToggleFilters,
  onUpload,
  search,
  onSearchChange,
  onStartTour,
  isOffline = false,
  pendingCount = 0,
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
    <nav className="fixed top-0 left-0 right-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow z-20">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4 p-2">
        <div className="flex items-center space-x-2">
          <Link to="/invoices" className="flex items-center space-x-1" onClick={() => { setMenuOpen(false); setUserOpen(false); }}>
            <img src={`/api/${tenant}/logo`} alt="logo" className="h-5 w-5" />
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
        <div className="flex items-center space-x-3 relative">
          {isOffline && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded" title="Offline mode">
              Offline{pendingCount ? ` (${pendingCount})` : ''}
            </span>
          )}
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
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
              title="Filters"
              aria-label="Toggle filters"
            >
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
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
                  <UserCircleIcon className="h-6 w-6" />
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
