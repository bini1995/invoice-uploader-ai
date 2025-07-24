import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export default function FraudHeader({ title, tooltip }) {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {tooltip && (
        <Tippy content={tooltip} placement="right">
          <span className="cursor-help text-gray-500">?</span>
        </Tippy>
      )}
    </div>
  );
}
