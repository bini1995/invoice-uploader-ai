import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE } from '../api';
import TenantSwitcher from './TenantSwitcher';
import NotificationBell from './NotificationBell';
import LanguageSelector from './LanguageSelector';
import DarkModeToggle from './DarkModeToggle';
import HighContrastToggle from './HighContrastToggle';
import useDarkMode from '../hooks/useDarkMode';
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

export default function ImprovedNavbar({
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
  const [darkMode, setDarkMode] = useDarkMode();
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
    fetch(`${API_BASE}/tenants/${tenant}/info`, { headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenant } })
      .then(r => r.ok ? r.json() : { name: tenant })
      .then(d => setTenantName(d.name || tenant))
      .catch(() => setTenantName(tenant));
  }, [tenant, token]);

  return (
    <nav className="bg-indigo-700/60 dark:bg-indigo-900/60 backdrop-blur text-white shadow h-16 flex-shrink-0">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left side - Logo and breadcrumbs */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <Link to="/claims" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <img
              src="/logo.png"
              alt="ClarifyOps logo"
              className="h-9 w-9"
            />
            <span className="font-bold text-lg hidden sm:block">
              <span className="text-slate-800 dark:text-white">Clarify</span>
              <span className="text-blue-600 dark:text-blue-400">Ops</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2 text-sm min-w-0">
            <span className="text-indigo-200 flex-shrink-0">›</span>
            <Link
              to={`/claims${sessionStorage.getItem('claimsQuery') || ''}`}
              className="flex items-center font-medium hover:text-indigo-200 transition-colors flex-shrink-0"
              title={t('switchProduct')}
            >
              ClarifyClaims
              <ChevronDownIcon className="h-4 w-4 ml-1 flex-shrink-0" />
            </Link>
            
            {crumbs.length > 0 && (
              <>
                <span className="text-indigo-200 flex-shrink-0">›</span>
                <span className="text-indigo-100 truncate">{crumbs[0]}</span>
              </>
            )}
          </div>
        </div>

        {/* Center - Search (if provided) */}
        {onSearchChange && (
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search claims..."
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Upload button */}
          {onUpload && (
            <button
              onClick={onUpload}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-sm"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span className="font-medium">Upload</span>
            </button>
          )}

          {/* Filters toggle */}
          {onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className="relative p-2 text-indigo-200 hover:text-white transition-colors"
              title="Toggle filters"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications */}
          {token && (
            <div className="flex-shrink-0">
              <NotificationBell
                notifications={notifications}
                onOpen={onNotificationsOpen}
              />
            </div>
          )}

          {/* Theme toggles */}
          <div className="hidden sm:flex items-center space-x-1 flex-shrink-0">
            <DarkModeToggle />
            <HighContrastToggle />
          </div>

          {/* User menu */}
          {token && (
            <div className="relative flex-shrink-0" ref={userRef}>
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setUserOpen(!userOpen)}
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">
                    {showRoleEmojis && role ? ROLE_EMOJI[role] : 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left min-w-0">
                  <div className="text-sm font-medium truncate">Admin</div>
                  <div className="text-xs text-indigo-200 truncate">{role}</div>
                </div>
                <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setUserOpen(false)}
                  >
                    <Squares2X2Icon className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setUserOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="mr-2">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            ref={menuRef}
            className="lg:hidden p-2 text-indigo-200 hover:text-white transition-colors flex-shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 absolute top-full left-0 right-0 z-50">
          <div className="px-4 py-2 space-y-2">
            <Link
              to="/operations"
              className="flex items-center px-2 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setMenuOpen(false)}
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Operations
            </Link>
            <Link
              to="/claims"
              className="flex items-center px-2 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setMenuOpen(false)}
            >
              <DocumentChartBarIcon className="h-4 w-4 mr-2" />
              Claims
            </Link>
            <Link
              to="/analytics"
              className="flex items-center px-2 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setMenuOpen(false)}
            >
              <FlagIcon className="h-4 w-4 mr-2" />
              Analytics
            </Link>
            <Link
              to="/vendors"
              className="flex items-center px-2 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setMenuOpen(false)}
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Vendors
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 
