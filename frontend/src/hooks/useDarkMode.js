import { useEffect, useState } from 'react';
import { logEvent } from '../lib/analytics';

export default function useDarkMode() {
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : prefersDark;
  });

  useEffect(() => {
      const theme = darkMode ? 'dark' : 'light';
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      logEvent('theme_change', { theme });
  }, [darkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        if (!localStorage.getItem('theme')) {
          setDarkMode(e.matches);
        }
      };
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  return [darkMode, setDarkMode];
}
