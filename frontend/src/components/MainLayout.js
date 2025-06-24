import React from 'react';
import SidebarNav from './SidebarNav';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';

export default function MainLayout({ title, helpTopic, children }) {
  const [notifications] = React.useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <SidebarNav notifications={notifications} />
      <div className="flex-1 pt-16 pb-16 sm:pb-0">
        <TopNavbar title={title} helpTopic={helpTopic} />
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
