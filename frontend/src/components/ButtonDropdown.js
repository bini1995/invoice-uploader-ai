import React, { useState, useRef } from 'react';
import useOutsideClick from '../hooks/useOutsideClick';

export default function ButtonDropdown({ icon, label, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        title={label}
        aria-label={label}
      >
        {icon}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border rounded shadow-lg text-sm z-20">
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
    >
      {children}
    </button>
  );
}
