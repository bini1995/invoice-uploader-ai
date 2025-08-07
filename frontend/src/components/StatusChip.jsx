import React from 'react';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { STATUS_TRANSITIONS } from '../lib/claimStatus';

const STYLES = {
  Extracted: 'bg-blue-100 text-blue-800',
  'Needs Review': 'bg-yellow-100 text-yellow-800',
  Flagged: 'bg-red-100 text-red-800',
  Approved: 'bg-green-100 text-green-800',
  Escalated: 'bg-purple-100 text-purple-800',
};

export default function StatusChip({ status }) {
  const cls = STYLES[status] || 'bg-gray-100 text-gray-800';
  const next = STATUS_TRANSITIONS[status] || [];
  const tip = next.length ? `Next: ${next.join(', ')}` : 'Terminal state';
  return (
    <Tippy content={tip}>
      <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{status || 'Unknown'}</span>
    </Tippy>
  );
}

StatusChip.propTypes = {
  status: PropTypes.string,
};
