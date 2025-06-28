import React, { useState, useRef } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  TrashIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import useOutsideClick from '../hooks/useOutsideClick';
import { Button } from './ui/Button';

export default function ActionToolbar({
  role,
  token,
  loading = false,
  loadingVendor = false,
  loadingInsights = false,
  activeFilterCount = 0,
  onUpload,
  onVendorSummary,
  onMonthlyInsights,
  onExportFiltered,
  onExportAll,
  onExportDashboard,
  onExportArchived,
  onReset,
  onClear,
  onToggleFilters,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const exportRef = useRef(null);
  const insightsRef = useRef(null);
  const filterRef = useRef(null);
  useOutsideClick(exportRef, () => setExportOpen(false));
  useOutsideClick(insightsRef, () => setInsightsOpen(false));

  return (
    <div className="sticky top-16 z-10 bg-white dark:bg-gray-800 border-b p-2 flex items-center gap-2 shadow">
      {role === 'admin' && (
        <Tippy content="Upload" placement="bottom">
          <Button
            onClick={onUpload}
            disabled={!token}
            size="icon"
            variant="outline"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
          </Button>
        </Tippy>
      )}
      <div className="relative" ref={insightsRef}>
        <Tippy content="Insights" placement="bottom">
          <Button
            onClick={() => setInsightsOpen((o) => !o)}
            size="icon"
            variant="outline"
          >
            <LightBulbIcon className="w-5 h-5" />
          </Button>
        </Tippy>
        {insightsOpen && (
          <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border rounded shadow text-sm flex flex-col w-36 z-20">
            <button onClick={onVendorSummary} className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
              {loadingVendor ? 'Loading…' : 'Vendor'}
            </button>
            <button onClick={onMonthlyInsights} className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-1">
              <ClockIcon className="w-4 h-4" /> {loadingInsights ? 'Loading…' : 'Monthly'}
            </button>
          </div>
        )}
      </div>
      <div className="relative" ref={exportRef}>
        <Tippy content="Export" placement="bottom">
          <Button
            onClick={() => setExportOpen((o) => !o)}
            size="icon"
            variant="outline"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </Button>
        </Tippy>
        {exportOpen && (
          <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border rounded shadow text-sm flex flex-col w-40 z-20">
            <button onClick={onExportFiltered} className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-1">
              Filtered CSV
            </button>
            <button onClick={onExportAll} className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-1">
              All CSV
            </button>
            <button onClick={onExportDashboard} className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-1">
              <DocumentArrowDownIcon className="w-4 h-4" /> Dashboard
            </button>
            <button onClick={onExportArchived} className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-1">
              <ArchiveBoxIcon className="w-4 h-4" /> Archived
            </button>
          </div>
        )}
      </div>
      <div className="relative ml-auto" ref={filterRef}>
        <Tippy content="Filters" placement="bottom">
          <Button
            onClick={() => {
              if (onToggleFilters) onToggleFilters();
            }}
            size="icon"
            variant="outline"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-4 w-4 text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </Tippy>
      </div>
      <div className="flex items-center gap-2">
        <Tippy content="Reset" placement="bottom">
          <Button onClick={onReset} size="icon" variant="outline">
            <ArrowPathIcon className="w-5 h-5" />
          </Button>
        </Tippy>
        {role === 'admin' && (
          <Tippy content="Clear" placement="bottom">
            <Button
              onClick={onClear}
              disabled={!token}
              size="icon"
              variant="outline"
              className="text-red-600"
            >
              <TrashIcon className="w-5 h-5" />
            </Button>
          </Tippy>
        )}
      </div>
    </div>
  );
}
