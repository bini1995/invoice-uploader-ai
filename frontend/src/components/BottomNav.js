import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function BottomNav() {
  const location = useLocation();
  const items = [
    { to: '/operations', icon: HomeIcon, label: 'Home' },
    { to: '/claims', icon: DocumentIcon, label: 'Claims' },
    { to: '/search', icon: MagnifyingGlassIcon, label: 'Search' },
    { to: '/batch-upload', icon: ArrowUpTrayIcon, label: 'Upload' },
    { to: '/settings', icon: Cog6ToothIcon, label: 'More' },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-20">
      <ul className="flex justify-around" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className={`flex flex-col items-center py-2 text-xs transition-colors ${
                location.pathname === to 
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
