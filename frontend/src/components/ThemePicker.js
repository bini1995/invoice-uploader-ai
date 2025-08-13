import React, { useState, useEffect, useRef } from 'react';
import useOutsideClick from '../hooks/useOutsideClick';
import { PaintBrushIcon } from '@heroicons/react/24/outline';

export default function ThemePicker({ darkMode, setDarkMode, tenant = 'default' }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, () => setOpen(false));
  const [mode, setMode] = useState(() => localStorage.getItem(`themeMode_${tenant}`) || (darkMode ? 'dark' : 'light'));
  const [accent, setAccent] = useState(() => localStorage.getItem(`accentColor_${tenant}`) || '#059669');
  const [font, setFont] = useState(() => localStorage.getItem(`fontFamily_${tenant}`) || 'Inter');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystem = () => setDarkMode(mq.matches);

    if (mode === 'system') {
      applySystem();
      mq.addEventListener('change', applySystem);
    } else {
      setDarkMode(mode === 'dark');
    }

    localStorage.setItem(`themeMode_${tenant}`, mode);

    return () => {
      mq.removeEventListener('change', applySystem);
    };
  }, [mode, setDarkMode, tenant]);

  useEffect(() => {
    document.documentElement.style.setProperty('--cta-bg', accent);
    document.documentElement.style.setProperty('--cta-hover', accent);
    document.documentElement.style.setProperty('--cta-active', accent);
    document.documentElement.style.setProperty('--focus-ring-color', accent);
    localStorage.setItem(`accentColor_${tenant}`, accent);
  }, [accent, tenant]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-ui', font);
    localStorage.setItem(`fontFamily_${tenant}`, font);
  }, [font, tenant]);

  useEffect(() => {
    const savedAccent = localStorage.getItem(`accentColor_${tenant}`);
    if (savedAccent) {
      document.documentElement.style.setProperty('--cta-bg', savedAccent);
      document.documentElement.style.setProperty('--cta-hover', savedAccent);
      document.documentElement.style.setProperty('--cta-active', savedAccent);
      document.documentElement.style.setProperty('--focus-ring-color', savedAccent);
    }
    const savedFont = localStorage.getItem(`fontFamily_${tenant}`);
    if (savedFont) document.documentElement.style.setProperty('--font-ui', savedFont);
  }, [tenant]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="rounded"
        title="Theme Picker"
        aria-label="Theme Picker"
      >
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
              <option value="Work Sans">Work Sans</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
