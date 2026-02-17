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
  User,
  LogOut,
  Send,
  Upload,
  Search,
  CreditCard,
  X,
} from 'lucide-react';

export default function ImprovedSidebarNav({ notifications = [], collapsed = false, mobileOpen = false, onMobileClose }) {
  const location = useLocation();
  const [desktopOpen, setDesktopOpen] = useState(!collapsed);
  const [claimCount, setClaimCount] = useState(null);
  
  useEffect(() => {
    if (collapsed) setDesktopOpen(false);
  }, [collapsed]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    import('../api').then(({ API_BASE }) => {
      fetch(`${API_BASE}/api/claims/quick-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            const total = (data.totalInvoicedThisMonth || 0) + (data.invoicesPending || 0) + (data.anomaliesCount || 0);
            setClaimCount(total);
          }
        })
        .catch(() => {});
    });
  }, []);
  
  const unread = notifications.filter(n => !n.read).length;
  const role = localStorage.getItem('role') || '';
  const userName = localStorage.getItem('userName') || '';
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('username') || '';
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  const [moreOpen, setMoreOpen] = useState(false);

  const showSearch = claimCount === null || claimCount >= 3 || location.pathname === '/search';

  const primaryItems = [
    { to: '/operations', icon: Home, label: 'Home', description: 'Dashboard and overview' },
    { to: '/batch-upload', icon: Upload, label: 'Upload', description: 'Upload claim files' },
    { to: '/claims', icon: FileText, label: 'Claims', description: 'View and review processed claims' },
    ...(showSearch ? [{ to: '/search', icon: Search, label: 'Search', description: 'Natural language claim search' }] : []),
    { to: '/delivery', icon: Send, label: 'Export', description: 'Download, export, and deliver results' },
  ];

  const secondaryItems = [
    { to: '/review', icon: FileSearch, label: 'Review Queue', description: 'Human review queue' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics', description: 'Analytics and insights' },
    { to: '/auditflow', icon: Flag, label: 'AuditFlow', description: 'Risk and audit review' },
    { to: '/vendors', icon: Users, label: 'Vendors', description: 'Vendor management' },
    { to: '/archive', icon: Archive, label: 'Archive', description: 'Archived documents' },
    { to: '/billing', icon: CreditCard, label: 'Billing', description: 'Plans and payments' },
    { to: '/settings', icon: Settings, label: 'Settings', description: 'Account and preferences' },
  ];

  const isOnSecondaryPage = secondaryItems.some(item => location.pathname === item.to);
  const showSecondary = moreOpen || isOnSecondaryPage;

  const navItems = [...primaryItems, ...(showSecondary ? secondaryItems : [])];

  const handleNavClick = () => {
    if (onMobileClose) onMobileClose();
  };

  const sidebarContent = (isOpen) => (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        {isOpen ? (
          <img src="/logo.png" alt="ClarifyOps" className="h-7 brightness-0 invert" />
        ) : (
          <span className="font-bold text-sm"><span className="text-white">C</span><span className="text-purple-400">O</span></span>
        )}
        <button
          onClick={() => {
            if (onMobileClose && mobileOpen) {
              onMobileClose();
            } else {
              setDesktopOpen(!desktopOpen);
            }
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/20 hover:bg-blue-600/40 transition-colors text-blue-400"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : isOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
              title={isOpen ? undefined : item.description}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'mr-3' : ''}`} />
              {isOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}

        <button
          onClick={() => setMoreOpen(!showSecondary)}
          className="w-full group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-700/50 hover:text-white"
          title={isOpen ? undefined : 'More options'}
        >
          <LayoutGrid className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'mr-3' : ''}`} />
          {isOpen && (
            <span className="text-sm font-medium truncate">{showSecondary ? 'Less' : 'More'}</span>
          )}
        </button>

        {showSecondary && (
          <div className="space-y-1 pt-1 border-t border-slate-700/40">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={`group flex items-center px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                  title={isOpen ? undefined : item.description}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isOpen ? 'mr-3' : ''}`} />
                  {isOpen && (
                    <span className="text-xs font-medium truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {unread > 0 && (
        <div className={`flex items-center px-3 py-2 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen && <span className="text-xs text-indigo-200">Notifications</span>}
          <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread}
          </span>
        </div>
      )}
      
      <div className="pt-4 border-t border-slate-700/50">
        <Link
          to="/profile"
          onClick={handleNavClick}
          className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-300 hover:bg-slate-700/50 hover:text-white ${
            location.pathname === '/profile' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' : ''
          }`}
          title={isOpen ? undefined : 'Profile'}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(userName)}
          </div>
          {isOpen && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>
          )}
        </Link>
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2.5 mt-2 rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-500/20 hover:text-red-400`}
          title={isOpen ? undefined : 'Log out'}
        >
          <LogOut className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'mr-3' : ''}`} />
          {isOpen && <span className="text-sm font-medium">Log out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:block fixed left-0 top-0 h-screen overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 z-30 transition-all duration-300 ${
          desktopOpen ? 'w-64' : 'w-16'
        }`}
      >
        {sidebarContent(desktopOpen)}
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
}
