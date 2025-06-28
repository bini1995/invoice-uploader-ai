import React from 'react';

export default function DateRangeSlider({ startDate, endDate, onChange }) {
  const base = new Date();
  base.setFullYear(base.getFullYear() - 1);
  const maxDays = 365;

  const startVal = startDate
    ? Math.min(
        Math.floor((new Date(startDate) - base) / (1000 * 60 * 60 * 24)),
        maxDays
      )
    : 0;
  const endVal = endDate
    ? Math.min(
        Math.floor((new Date(endDate) - base) / (1000 * 60 * 60 * 24)),
        maxDays
      )
    : maxDays;

  const handleStart = (e) => {
    const newStart = Math.min(Number(e.target.value), endVal);
    const dateStr = new Date(base.getTime() + newStart * 86400000)
      .toISOString()
      .slice(0, 10);
    onChange([dateStr, endDate]);
  };

  const handleEnd = (e) => {
    const newEnd = Math.max(Number(e.target.value), startVal);
    const dateStr = new Date(base.getTime() + newEnd * 86400000)
      .toISOString()
      .slice(0, 10);
    onChange([startDate, dateStr]);
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{startDate || 'Start'}</span>
        <span>{endDate || 'End'}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min="0"
          max={maxDays}
          value={startVal}
          onChange={handleStart}
          className="absolute w-full pointer-events-none appearance-none bg-transparent"
          style={{ zIndex: 2 }}
        />
        <input
          type="range"
          min="0"
          max={maxDays}
          value={endVal}
          onChange={handleEnd}
          className="absolute w-full pointer-events-none appearance-none bg-transparent"
          style={{ zIndex: 1 }}
        />
      </div>
    </div>
  );
}
