import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import useDarkMode from '../hooks/useDarkMode';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
      aria-label="Toggle dark mode"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
    </button>
  );
}
