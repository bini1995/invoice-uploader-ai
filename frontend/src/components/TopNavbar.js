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
    <header className="sticky top-0 z-30 h-12 bg-indigo-700/60 dark:bg-indigo-900/60 backdrop-blur text-white shadow flex items-center justify-between px-4">
      <h1 className="text-lg font-semibold flex items-center space-x-2">
        <img src="/logo.png" alt="logo" className="h-6 w-6" />
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
        <Link to={token ? '/operations' : '/'} className="underline">Back to App</Link>
      </div>
    </header>
  );
}
