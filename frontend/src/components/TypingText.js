import React, { useEffect, useState } from 'react';

export default function TypingText({ texts, speed = 100, delay = 1500, className = '' }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    const current = texts[index];
    if (subIndex < current.length) {
      const timeout = setTimeout(() => setSubIndex(subIndex + 1), speed);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => {
      setSubIndex(0);
      setIndex((index + 1) % texts.length);
    }, delay);
    return () => clearTimeout(timeout);
  }, [subIndex, index, texts, speed, delay]);

  return <span className={className}>{texts[index].substring(0, subIndex)}</span>;
}
