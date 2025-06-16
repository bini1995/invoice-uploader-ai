import React, { useState, useEffect } from 'react';
import { PaintBrushIcon } from '@heroicons/react/24/outline';

export default function ThemePicker({ darkMode, setDarkMode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || (darkMode ? 'dark' : 'light'));
  const [accent, setAccent] = useState(() => localStorage.getItem('accentColor') || '#4f46e5');
  const [font, setFont] = useState(() => localStorage.getItem('fontFamily') || 'Inter');

  useEffect(() => {
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDark);
    } else {
      setDarkMode(mode === 'dark');
    }
    localStorage.setItem('themeMode', mode);
  }, [mode, setDarkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accent);
    localStorage.setItem('accentColor', accent);
  }, [accent]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-base', font);
    localStorage.setItem('fontFamily', font);
  }, [font]);

  useEffect(() => {
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) document.documentElement.style.setProperty('--accent-color', savedAccent);
    const savedFont = localStorage.getItem('fontFamily');
    if (savedFont) document.documentElement.style.setProperty('--font-base', savedFont);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="focus:outline-none" title="Theme Picker">
        <PaintBrushIcon className="h-6 w-6" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded shadow-lg space-y-2 text-sm z-40">
          <div>
            <label className="block font-medium mb-1">Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)} className="input w-full">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Accent</label>
            <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-full h-8 p-0 border border-gray-300" />
          </div>
          <div>
            <label className="block font-medium mb-1">Font</label>
            <select value={font} onChange={e => setFont(e.target.value)} className="input w-full">
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
