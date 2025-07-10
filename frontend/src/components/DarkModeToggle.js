import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import useDarkMode from '../hooks/useDarkMode';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 ml-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
      aria-label="Toggle dark mode"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <SunIcon className="h-6 w-6 text-yellow-400 transform transition-transform duration-300 rotate-90" />
      ) : (
        <MoonIcon className="h-6 w-6 text-indigo-200 transform transition-transform duration-300" />
      )}
    </button>
  );
}
