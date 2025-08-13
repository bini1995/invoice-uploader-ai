import React, { useState, useEffect, useRef } from 'react';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { logEvent } from '../lib/analytics';

export default function HelpTooltip({ term }) {
  const { t } = useTranslation();
  const id = term?.toLowerCase().replace(/\s+/g, '_');
  const definition = t(`glossary.${id}`);
  const version = t('glossary.version');
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => {
    const seenState = JSON.parse(localStorage.getItem('glossarySeen') || '{}');
    return !!seenState[id];
  });
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  if (!definition) return null;

  const markSeen = () => {
    if (seen) return;
    const seenState = JSON.parse(localStorage.getItem('glossarySeen') || '{}');
    seenState[id] = true;
    localStorage.setItem('glossarySeen', JSON.stringify(seenState));
    setSeen(true);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      markSeen();
      logEvent('glossary_tooltip_open', { term: id, version });
    }
  };

  return (
    <span className="inline-block relative">
      <button
        type="button"
        onClick={toggle}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        aria-label={term}
        className={`ml-1 text-muted focus:outline-none focus:ring-focus focus:ring-offset-2 rounded transition-colors duration-fast ${seen ? 'opacity-60' : ''}`}
      >
        <QuestionMarkCircleIcon className="w-4 h-4" aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="absolute z-popover bg-surface text-ink border border-default rounded-md p-2 shadow-e2 mt-1 text-sm w-56"
        >
          <div className="pr-4">{definition}</div>
          <button
            type="button"
            aria-label={t('close')}
            onClick={() => setOpen(false)}
            className="absolute top-1 right-1 text-muted focus:outline-none focus:ring-focus rounded"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
          <div className="mt-2 text-[10px] text-muted">v{version}</div>
        </div>
      )}
    </span>
  );
}
