import React from 'react';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import HelpTooltip from './HelpTooltip';

export default function AIInsightChip({ insight }) {
  if (!insight) {
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded text-xs">No Insight</span>
    );
  }
  const { message, confidence, why } = insight;
  const conf = confidence != null ? ` (${Math.round(confidence * 100)}%)` : '';
  return (
    <Tippy content={why || ''}>
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs inline-flex items-center">
        {message}
        <HelpTooltip term={message} />
        {conf}
      </span>
    </Tippy>
  );
}

AIInsightChip.propTypes = {
  insight: PropTypes.shape({
    message: PropTypes.string.isRequired,
    confidence: PropTypes.number,
    why: PropTypes.string,
  }),
};
