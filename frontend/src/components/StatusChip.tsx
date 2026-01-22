import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { STATUS_TRANSITIONS } from '../lib/claimStatus';
import { getStatusDetails } from '../theme/statuses';
import { logEvent } from '../lib/analytics';

export default function StatusChip({ status }) {
    const detail = getStatusDetails(status?.toLowerCase().replace(/\s+/g, '_'));
    const next = STATUS_TRANSITIONS[status] || [];
    const tip = next.length ? `Next: ${next.join(', ')}` : 'Terminal state';
    const Icon = detail.icon;
    useEffect(() => {
      if (status) logEvent('status_chip_impression', { status });
    }, [status]);
    return (
      <Tippy content={tip}>
        <span className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${detail.class}`}>
          <Icon className="w-3 h-3" aria-hidden="true" />
          {status || 'Unknown'}
        </span>
      </Tippy>
    );
  }

StatusChip.propTypes = {
  status: PropTypes.string,
};
