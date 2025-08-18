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