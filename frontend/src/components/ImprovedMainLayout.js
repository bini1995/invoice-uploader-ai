import React, { useState } from 'react';
import ImprovedSidebarNav from './ImprovedSidebarNav';
import ImprovedNavbar from './ImprovedNavbar';
import BottomNav from './BottomNav';
import AISupportBot from './AISupportBot';

export default function ImprovedMainLayout({ title, helpTopic, children, collapseSidebar = false }) {
  const [notifications] = React.useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [tenant, setTenant] = React.useState(() => localStorage.getItem('tenant') || 'default');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <ImprovedSidebarNav 
        notifications={notifications} 
        collapsed={collapseSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64 min-w-0">
        <div className="flex-shrink-0">
          <ImprovedNavbar
            tenant={tenant}
            onTenantChange={setTenant}
            notifications={notifications}
            role={role}
            token={token}
            onLogout={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              window.location.href = '/login';
            }}
            onMobileMenuToggle={() => setMobileMenuOpen(prev => !prev)}
          />
        </div>
        
        <main className="flex-1 overflow-y-auto min-w-0 pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
      {token && <AISupportBot />}
    </div>
  );
}
