import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HelpTooltip from './HelpTooltip';
import LanguageSelector from './LanguageSelector';
import DarkModeToggle from './DarkModeToggle';
import HighContrastToggle from './HighContrastToggle';

export default function TopNavbar({ title, helpTopic }) {
  const token = localStorage.getItem('token') || '';
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 shadow-sm flex justify-between items-center">
      <h1 className="text-lg font-semibold flex items-center space-x-2 text-gray-900 dark:text-gray-100">
        <img src="/logo192.png" alt="logo" className="h-6 w-6" />
        <span>{t('title')}</span>
        <span className="opacity-70">/ {title}</span>
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
    </header>
  );
}
