import React, { useState, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import useOutsideClick from '../hooks/useOutsideClick';

export default function NotificationBell({ notifications = [], onOpen }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, () => setOpen(false));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!open && onOpen) onOpen();
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className="relative focus:outline-none"
        onClick={handleToggle}
        aria-label="Notifications"
        title="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 text-[10px] bg-red-600 text-white rounded-full ring-2 ring-indigo-700">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded p-2 z-50">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-300">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="text-sm border-b border-gray-200 dark:border-gray-700 last:border-none p-2 text-gray-700 dark:text-gray-200"
              >
                {n.text}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
