import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HelpTooltip from './HelpTooltip';
import LanguageSelector from './LanguageSelector';
import DarkModeToggle from './DarkModeToggle';
import HighContrastToggle from './HighContrastToggle';

export default function TopNavbar({ title, helpTopic }) {
  const { t } = useTranslation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return (
    <header className="sticky top-0 z-30 h-12 bg-indigo-700/60 dark:bg-indigo-900/60 backdrop-blur text-white shadow flex items-center justify-between px-4">
      <div className="text-lg font-semibold flex items-center space-x-3">
        <img src="/logo.png" alt="ClarifyOps" className="h-9 w-auto" />
        <span className="opacity-70">/ {title}</span>
        {helpTopic && <HelpTooltip term={helpTopic} />}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <HighContrastToggle />
        <DarkModeToggle />
        <Link to={token ? '/operations' : '/'} className="underline">Back to App</Link>
      </div>
    </header>
  );
}
