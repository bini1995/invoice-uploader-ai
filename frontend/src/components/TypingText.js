import React, { useEffect, useState } from 'react';

export default function TypingText({ text, speed = 100, className = '' }) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [subIndex, setSubIndex] = useState(
    prefersReducedMotion ? text.length : 0
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (subIndex < text.length) {
      const timeout = setTimeout(() => setSubIndex(subIndex + 1), speed);
      return () => clearTimeout(timeout);
    }
  }, [subIndex, text, speed, prefersReducedMotion]);

  return <span className={`typewriter ${className}`}>{text.substring(0, subIndex)}</span>;
}
