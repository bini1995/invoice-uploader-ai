import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TenantSwitcher from './TenantSwitcher';
import NotificationBell from './NotificationBell';
import LanguageSelector from './LanguageSelector';
import DarkModeToggle from './DarkModeToggle';
import HighContrastToggle from './HighContrastToggle';
import useOutsideClick from '../hooks/useOutsideClick';
import { useTranslation } from 'react-i18next';
import { ROLE_EMOJI } from '../theme/roles';
import {
  Bars3Icon,
  AdjustmentsHorizontalIcon,
  HomeIcon,
  DocumentChartBarIcon,
  ArchiveBoxIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  Squares2X2Icon,
  FlagIcon,
  ChevronDownIcon,
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
  const [tenantName, setTenantName] = useState(tenant);
  const menuRef = useRef(null);
  const userRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false));
  useOutsideClick(userRef, () => setUserOpen(false));
  const { t } = useTranslation();
  const [showBadge, setShowBadge] = useState(localStorage.getItem('showMyRoleBadge') !== 'false');
  const showRoleEmojis = localStorage.getItem('showRoleEmojis') !== 'false';
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const crumbs = pathParts.slice(1).map((c, i) => {
    if (i === 0 && /^\d+$/.test(c)) return `Claim ${c}`;
    return c.replace(/-/g, ' ').replace(/^./, (ch) => ch.toUpperCase());
  });

  useEffect(() => {
    if (location.pathname.startsWith('/claims')) {
      sessionStorage.setItem('claimsQuery', location.search);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/tenants/${tenant}/info`, { headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenant } })
      .then(r => r.ok ? r.json() : { name: tenant })
      .then(d => setTenantName(d.name || tenant))
      .catch(() => setTenantName(tenant));
  }, [tenant, token]);

  return (
    <nav className="sticky top-0 z-30 bg-indigo-700/60 dark:bg-indigo-900/60 backdrop-blur text-white shadow h-16">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:flex-wrap justify-between items-center gap-4 p-2">
        <div className="flex items-center space-x-2">
          <Link to="/claims" className="flex items-center space-x-1" onClick={() => { setMenuOpen(false); setUserOpen(false); }}>
            <img
              src="/logo.png"
              alt="ClarifyOps logo"
              className="h-7 w-auto"
            />
            <span className="font-semibold text-sm">{t('title')}</span>
            <span className="ml-1 text-xs opacity-80">{tenantName}</span>
          </Link>
          <span className="text-xs opacity-80">›</span>
          <Link
            to={`/claims${sessionStorage.getItem('claimsQuery') || ''}`}
            className="flex items-center text-sm font-medium"
            title={t('switchProduct')}
            aria-label={t('switchProduct')}
          >
            ClarifyClaims
            <ChevronDownIcon className="h-4 w-4 ml-1" />
          </Link>
          {crumbs.map((c) => (
            <React.Fragment key={c}>
              <span className="text-xs opacity-80">›</span>
              <span className="text-xs opacity-80">{c}</span>
            </React.Fragment>
          ))}
        </div>
        <input
          id="searchInput"
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="input text-gray-800 dark:text-gray-100 h-7 text-sm w-full sm:w-auto"
        />
        <input
          id="smartSearchInput"
          type="text"
          value={smartQuery}
          onChange={(e) => onSmartQueryChange?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSmartSearch?.()}
          placeholder="Claim Documents from Amazon last quarter > $1,000"
          aria-label="Smart search"
          className="input text-gray-800 dark:text-gray-100 h-7 text-sm w-full sm:w-52"
        />
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 relative w-full sm:w-auto justify-end">
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
                  title={t('menu')}
                  aria-label={t('menu')}
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
              <HelpTooltip term="dashboard" />
              <DarkModeToggle />
              <HighContrastToggle />
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center space-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded relative"
                  title={t('account')}
                  aria-label={t('account')}
                >
                  <img
                    src="https://api.dicebear.com/7.x/initials/svg?seed=bini&backgroundColor=5B21B6&textColor=ffffff"
                    alt="avatar"
                    className="h-6 w-6 rounded-full"
                  />
                  {showRoleEmojis && showBadge && ROLE_EMOJI[role] && (
                    <span className="absolute -bottom-1 -right-1 text-xs" aria-hidden="true">{ROLE_EMOJI[role]}</span>
                  )}
                  <span className="text-sm">Bini</span>
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded shadow-lg">
                    {onStartTour && (
                      <button
                        onClick={() => { onStartTour(); setUserOpen(false); }}
                        className="block px-4 py-2 text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t('startTour')}
                      </button>
                    )}
                    <label className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={showBadge}
                        onChange={() => {
                          const next = !showBadge;
                          setShowBadge(next);
                          localStorage.setItem('showMyRoleBadge', String(next));
                        }}
                      />
                      <span className="text-left flex-1">Show role badge</span>
                    </label>
                    <button
                      onClick={onLogout}
                      className="block px-4 py-2 text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('logout')}
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
