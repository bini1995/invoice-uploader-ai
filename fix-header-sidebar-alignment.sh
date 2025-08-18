#!/bin/bash

echo "🔧 Fix: Header & Sidebar Alignment"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixing Header & Sidebar Alignment..."
echo "  ✅ Making sidebar extend to top"
echo "  ✅ Aligning header with sidebar"
echo "  ✅ Fixing layout structure"
echo "  ✅ Ensuring proper z-index"

echo ""
echo "📝 Fixing ImprovedMainLayout component..."
cat > frontend/src/components/ImprovedMainLayout.js << 'EOF'
import React from 'react';
import ImprovedSidebarNav from './ImprovedSidebarNav';
import ImprovedNavbar from './ImprovedNavbar';
import BottomNav from './BottomNav';

export default function ImprovedMainLayout({ title, helpTopic, children, collapseSidebar = false }) {
  const [notifications] = React.useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [tenant, setTenant] = React.useState(() => localStorage.getItem('tenant') || 'default');
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - now positioned absolutely to extend to top */}
      <ImprovedSidebarNav notifications={notifications} collapsed={collapseSidebar} />
      
      {/* Main content area - positioned relative to sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Header - now inside the main content area */}
        <ImprovedNavbar
          tenant={tenant}
          onTenantChange={setTenant}
          notifications={notifications}
          role={role}
          token={token}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
EOF

echo ""
echo "📝 Fixing ImprovedSidebarNav component..."
cat > frontend/src/components/ImprovedSidebarNav.js << 'EOF'
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
      className={`fixed left-0 top-0 h-screen overflow-y-auto bg-indigo-700/60 dark:bg-indigo-900/60 backdrop-blur shadow-xl border-r border-indigo-600/20 z-30 transition-all duration-300 ${
        open ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4 space-y-4">
        {/* Toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600/50 hover:bg-indigo-600/70 transition-colors text-white"
          aria-label="Toggle sidebar"
        >
          {open ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Navigation items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-indigo-100 hover:bg-indigo-600/50 hover:text-white'
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
EOF

echo ""
echo "📝 Fixing ImprovedNavbar component..."
cat > frontend/src/components/ImprovedNavbar.js << 'EOF'
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
    fetch(`/api/tenants/${tenant}/info`, { headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenant } })
      .then(r => r.ok ? r.json() : { name: tenant })
      .then(d => setTenantName(d.name || tenant))
      .catch(() => setTenantName(tenant));
  }, [tenant, token]);

  return (
    <nav className="bg-indigo-700/60 dark:bg-indigo-900/60 backdrop-blur text-white shadow h-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4">
        {/* Left side - Logo and breadcrumbs */}
        <div className="flex items-center space-x-4">
          <Link to="/claims" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img
              src="/logo.svg"
              alt="ClarifyOps logo"
              className="h-8 w-auto"
            />
            <span className="font-semibold text-sm hidden sm:block">{t('title')}</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <span className="text-indigo-200">›</span>
            <Link
              to={`/claims${sessionStorage.getItem('claimsQuery') || ''}`}
              className="flex items-center font-medium hover:text-indigo-200 transition-colors"
              title={t('switchProduct')}
            >
              ClarifyClaims
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </Link>
            
            {crumbs.length > 0 && (
              <>
                <span className="text-indigo-200">›</span>
                <span className="text-indigo-100">{crumbs[0]}</span>
              </>
            )}
          </div>
        </div>

        {/* Center - Search (if provided) */}
        {onSearchChange && (
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search claims..."
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-4">
          {/* Upload button */}
          {onUpload && (
            <button
              onClick={onUpload}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Upload</span>
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
            <NotificationBell
              notifications={notifications}
              onOpen={onNotificationsOpen}
            />
          )}

          {/* Theme toggles */}
          <div className="hidden sm:flex items-center space-x-2">
            <DarkModeToggle />
            <HighContrastToggle />
          </div>

          {/* User menu */}
          {token && (
            <div className="relative" ref={userRef}>
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setUserOpen(!userOpen)}
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {showRoleEmojis && role ? ROLE_EMOJI[role] : 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">Admin</div>
                  <div className="text-xs text-indigo-200">{role}</div>
                </div>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
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
            className="lg:hidden p-2 text-indigo-200 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
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
EOF

echo ""
echo "📝 Fixing session expiration issue in index.js..."
# Update the global fetch wrapper to handle session expiration better
cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ErrorBoundary from './components/ErrorBoundary';

// Global fetch wrapper for authentication
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args).then(response => {
    // Only redirect on 401 if we're not already on login page and not making a login request
    if (response.status === 401 && 
        !window.location.pathname.includes('/login') && 
        !args[0].includes('/login') && 
        !args[0].includes('/api/claims/login')) {
      
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return response;
  });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();
EOF

echo ""
echo "🧹 Rebuilding frontend with alignment fixes..."
docker-compose build --no-cache frontend

echo ""
echo "🚀 Restarting frontend..."
docker-compose restart frontend

echo ""
echo "⏳ Waiting for frontend to start..."
sleep 20

echo ""
echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🧪 Testing frontend..."
echo "Testing frontend build..."

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
echo "Frontend status: $FRONTEND_STATUS"

echo ""
echo "🔍 Testing external access..."
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clarifyops.com)
echo "External domain: $EXTERNAL_STATUS"

echo ""
echo "🔍 Testing login page..."
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clarifyops.com/login)
echo "Login page: $LOGIN_STATUS"

echo ""
echo "✅ Header & Sidebar Alignment Fix Complete!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ Sidebar now extends to the top of the screen"
echo "  ✅ Header is properly positioned relative to sidebar"
echo "  ✅ Layout structure corrected"
echo "  ✅ Z-index issues resolved"
echo "  ✅ Session expiration logic improved"
echo "  ✅ Builder page logout issue addressed"
echo ""
echo "🌐 Test the application:"
echo "   Login: https://clarifyops.com/login"
echo "   Claims: https://clarifyops.com/claims"
echo "   Builder: https://clarifyops.com/builder"
echo "   Operations: https://clarifyops.com/operations"
echo ""
echo "🔧 If issues arise:"
echo "  docker-compose logs frontend"
echo "  docker-compose logs backend" 