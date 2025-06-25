import React from 'react';
import { EyeDropperIcon } from '@heroicons/react/24/outline';
import useHighContrast from '../hooks/useHighContrast';

export default function HighContrastToggle() {
  const [highContrast, setHighContrast] = useHighContrast();
  return (
    <button
      onClick={() => setHighContrast(!highContrast)}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
      aria-label="Toggle high contrast mode"
      title={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
    >
      <EyeDropperIcon className="h-6 w-6" />
    </button>
  );
}
