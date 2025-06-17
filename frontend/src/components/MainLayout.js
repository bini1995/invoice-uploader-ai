import React from 'react';
import SidebarNav from './SidebarNav';
import TopNavbar from './TopNavbar';

export default function MainLayout({ title, helpTopic, children }) {
  const [notifications] = React.useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <SidebarNav notifications={notifications} />
      <div className="flex-1 p-4 pt-16">
        <TopNavbar title={title} helpTopic={helpTopic} />
        {children}
      </div>
    </div>
  );
}
