import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Spinner from './Spinner';
import useClaimActions from '../hooks/useClaimActions';

const ENABLED = import.meta.env.VITE_REVIEW_ACTIONS === 'true';

export default function ReviewButtons({ claimId, status, addToast }) {
  const {
    canApprove,
    canRequestInfo,
    canEscalate,
    approve,
    approving,
    requestInfo,
    requesting,
    escalate,
    escalating,
  } = useClaimActions(claimId, status);

  if (!ENABLED) return null;

  const handle = async (actionFn, confirm = false) => {
    if (confirm && !window.confirm('Are you sure?')) return;
    try {
      await actionFn();
    } catch (e) {
      addToast && addToast(e.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handle(approve, true)}
        disabled={!canApprove || approving}
        className="btn btn-ghost p-1 text-xs flex items-center gap-1 disabled:opacity-50"
      >
        {approving ? <Spinner className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
        Approve
      </button>
      <button
        onClick={() => handle(requestInfo)}
        disabled={!canRequestInfo || requesting}
        className="btn btn-ghost p-1 text-xs flex items-center gap-1 disabled:opacity-50"
      >
        {requesting ? <Spinner className="w-4 h-4" /> : <InformationCircleIcon className="w-4 h-4" />}
        Request Info
      </button>
      <button
        onClick={() => handle(escalate, true)}
        disabled={!canEscalate || escalating}
        className="btn btn-ghost p-1 text-xs flex items-center gap-1 disabled:opacity-50"
      >
        {escalating ? <Spinner className="w-4 h-4" /> : <ExclamationTriangleIcon className="w-4 h-4" />}
        Escalate
      </button>
    </div>
  );
}

ReviewButtons.propTypes = {
  claimId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  status: PropTypes.string,
  addToast: PropTypes.func,
};
