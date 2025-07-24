import React from 'react';
import SidebarNav from './SidebarNav';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function MainLayout({ title, helpTopic, children, collapseSidebar = false }) {
  const [notifications] = React.useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [tenant, setTenant] = React.useState(() => localStorage.getItem('tenant') || 'default');
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';
  const sidebarOffset = collapseSidebar ? 'ml-16' : 'ml-64';
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarNav notifications={notifications} collapsed={collapseSidebar} />
      <div className={`flex-1 flex flex-col overflow-y-auto pb-16 sm:pb-0 ${sidebarOffset}`}>
        <Navbar
          tenant={tenant}
          onTenantChange={setTenant}
          notifications={notifications}
          role={role}
          token={token}
        />
        <div className="container mx-auto px-6 py-8 flex-grow">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
