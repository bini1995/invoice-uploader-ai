import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  DocumentIcon,
  InboxIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

export default function BottomNav() {
  const location = useLocation();
  const items = [
    { to: '/dashboard', icon: HomeIcon, label: 'Home' },
    { to: '/invoices', icon: DocumentIcon, label: 'Documents' },
    { to: '/inbox', icon: InboxIcon, label: 'Inbox' },
    { to: '/archive', icon: ArchiveBoxIcon, label: 'Archive' },
  ];
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t z-20">
      <ul className="flex justify-around">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <motion.div whileHover={{ scale: 1.1 }} className="py-2">
              <Link
                to={to}
                className={`flex flex-col items-center text-xs ${
                  location.pathname === to ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                {label}
              </Link>
            </motion.div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
