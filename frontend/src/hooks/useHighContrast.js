import { useState, useEffect } from 'react';

export default function useHighContrast() {
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('contrast') === 'high');

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('contrast', 'high');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('contrast', 'normal');
    }
  }, [highContrast]);

  return [highContrast, setHighContrast];
}
