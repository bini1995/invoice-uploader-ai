import React from 'react';
import { Link } from 'react-router-dom';
import HelpTooltip from './HelpTooltip';
import LanguageSelector from './LanguageSelector';
import DarkModeToggle from './DarkModeToggle';
import HighContrastToggle from './HighContrastToggle';

export default function TopNavbar({ title, helpTopic }) {
  const token = localStorage.getItem('token') || '';
  return (
    <nav className="sticky top-0 bg-indigo-700 dark:bg-indigo-900 text-white shadow flex justify-between items-center p-2 z-20">
      <h1 className="text-xl font-bold flex items-center gap-1">
        {title}
        {helpTopic && (
          <span className="relative group cursor-help">❓
            <span className="hidden group-hover:block absolute z-10">
              <HelpTooltip topic={helpTopic} token={token} />
            </span>
          </span>
        )}
      </h1>
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <HighContrastToggle />
        <DarkModeToggle />
        <Link to="/invoices" className="underline">Back to App</Link>
      </div>
    </nav>
  );
}
