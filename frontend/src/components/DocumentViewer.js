import React, { useState } from 'react';

/**
 * Displays claim data and corresponding AI findings side by side.
 *
 * @param {Object} props - Component props.
 * @param {{id: string, title: string}[]} [props.sections=[]] - Section metadata.
 * @param {Object<string, any>} [props.claim={}] - Claim data keyed by section id.
 * @param {Object<string, any>} [props.findings={}] - AI findings keyed by section id.
 * @returns {JSX.Element}
 */
export default function DocumentViewer({ sections = [], claim = {}, findings = {} }) {
  const first = sections[0]?.id || null;
  const [active, setActive] = useState(first);

  if (!sections.length) return <div className="text-xs text-gray-500">No sections</div>;

  return (
    <div className="flex gap-4">
      <nav className="w-32">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`block w-full text-left px-2 py-1 text-sm rounded ${
              active === s.id ? 'bg-indigo-100' : 'hover:bg-gray-100'
            }`}
          >
            {s.title}
          </button>
        ))}
      </nav>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div className="border p-2 rounded overflow-auto">
          <h3 className="font-semibold text-sm mb-1">Claim</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(claim[active] || {}, null, 2)}
          </pre>
        </div>
        <div className="border p-2 rounded overflow-auto">
          <h3 className="font-semibold text-sm mb-1">AI Findings</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(findings[active] || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
