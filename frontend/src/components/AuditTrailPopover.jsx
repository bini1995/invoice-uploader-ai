import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import useAuditLog from '../hooks/useAuditLog';

export default function AuditTrailPopover({ claimId }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ actor: '', action: '', date: '' });
  const { logs, isLoading, isError, total } = useAuditLog(
    claimId,
    { page, ...filters },
    open
  );

  const content = (
    <div className="text-left text-xs w-64" tabIndex={0}>
      <div className="flex gap-1 mb-1">
        <input
          placeholder="Actor"
          value={filters.actor}
          onChange={(e) => setFilters({ ...filters, actor: e.target.value })}
          className="input input-sm flex-1"
        />
        <input
          placeholder="Action"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="input input-sm flex-1"
        />
      </div>
      {isError && <div className="text-red-600">Error loading logs</div>}
      {isLoading ? (
        <div>Loading...</div>
      ) : logs.length ? (
        <ul className="max-h-40 overflow-y-auto mb-1">
          {logs.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      ) : (
        <div>No audit logs</div>
      )}
      <div className="flex justify-between mt-1">
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>
          Page {page}
          {total ? ` / ${Math.ceil(total / 10)}` : ''}
        </span>
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setPage((p) => p + 1)}
          disabled={total && page >= Math.ceil(total / 10)}
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <Tippy
      content={content}
      interactive={true}
      onShow={() => setOpen(true)}
      onHide={() => setOpen(false)}
    >
      <button className="btn btn-ghost p-1 text-xs" aria-haspopup="dialog">
        Audit
      </button>
    </Tippy>
  );
}

AuditTrailPopover.propTypes = {
  claimId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
