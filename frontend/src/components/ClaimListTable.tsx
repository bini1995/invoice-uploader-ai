import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { unparse } from 'papaparse';
import { Button } from './ui/Button';
import StatusChip from './StatusChip';
import AIInsightChip from './AIInsightChip';
import NotesPanel from './NotesPanel';
import ReviewButtons from './ReviewButtons';
import AuditTrailPopover from './AuditTrailPopover';
import Toast from './Toast';
import { VariableSizeList as List } from 'react-window';

export default function ClaimListTable({ columns, data }) {
  const [sorting, setSorting] = useState([]);
  const [columnSizing, setColumnSizing] = useState({});
  const [exportOpen, setExportOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const addToast = useCallback((text, type = 'error') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((tt) => tt.id !== id)), 3000);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnSizing,
    },
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const listRef = useRef(null);
  const rowHeights = useRef({});
  const Inner = React.forwardRef((props, ref) => (
    <ul role="list" {...props} ref={ref} />
  ));

  const exportRows = (format) => {
    const rows = table.getRowModel().rows.map((r) => r.original);
    let blob;
    if (format === 'csv') {
      blob = new Blob([unparse(rows)], { type: 'text/csv' });
    } else {
      blob = new Blob([JSON.stringify(rows, null, 2)], {
        type: 'application/json',
      });
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  return (
    <div className="space-y-2 relative">
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.text} type={t.type} />
        ))}
      </div>
      {isMobile && (
        <List
          height={Math.min(
            600,
            (typeof window !== 'undefined' ? window.innerHeight : 800) - 160
          )}
          itemCount={table.getRowModel().rows.length}
          itemSize={(index) => rowHeights.current[index] || 120}
          estimatedItemSize={120}
          overscanCount={3}
          innerElementType={Inner}
          ref={listRef}
          width="100%"
        >
          {({ index, style }) => {
            const row = table.getRowModel().rows[index];
            return (
              <li
                role="listitem"
                key={row.id}
                style={style}
                tabIndex={0}
                aria-label={`Claim #${row.original.claim_id}, ${row.original.status || 'Status unknown'}, assigned to ${row.original.assignee || 'Unassigned'}`}
                className={`border rounded p-3 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  row.original.flagged_issues ? 'bg-red-50' : 'bg-white'
                }`}
                ref={(el) => {
                  if (el) {
                    const h = el.getBoundingClientRect().height;
                    if (rowHeights.current[index] !== h) {
                      rowHeights.current[index] = h;
                      listRef.current?.resetAfterIndex(index);
                    }
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    Claim ID: {row.original.claim_id}
                  </div>
                  <StatusChip status={row.original.status} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    {row.original.assignee ? (
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.original.assignee}&size=64`}
                        srcSet={`https://api.dicebear.com/7.x/initials/svg?seed=${row.original.assignee}&size=64 1x, https://api.dicebear.com/7.x/initials/svg?seed=${row.original.assignee}&size=128 2x`}
                        sizes="32px"
                        loading="lazy"
                        alt={row.original.assignee}
                        className="h-8 w-8 rounded-full"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {row.original.updated_at
                      ? new Date(row.original.updated_at).toLocaleString()
                      : '—'}
                  </span>
                </div>
              </li>
            );
          }}
        </List>
      )}
      {!isMobile && (
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg overflow-hidden">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-200 dark:bg-gray-700">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative px-2 py-1 select-none"
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{ asc: ' \u2191', desc: ' \u2193' }[
                      header.column.getIsSorted()
                    ] || null}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`resizer${
                          header.column.getIsResizing() ? ' isResizing' : ''
                        }`}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-t hover:bg-gray-100 ${
                  row.original.flagged_issues ? 'bg-red-50' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => {
                  const value = cell.getValue();
                  let content;
                  switch (cell.column.id) {
                    case 'status':
                      content = <StatusChip status={value} />;
                      break;
                    case 'assignee':
                      content = value ? (
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${value}&size=64`}
                          srcSet={`https://api.dicebear.com/7.x/initials/svg?seed=${value}&size=64 1x, https://api.dicebear.com/7.x/initials/svg?seed=${value}&size=128 2x`}
                          sizes="24px"
                          loading="lazy"
                          alt={value}
                          className="h-6 w-6 rounded-full mx-auto"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      );
                      break;
                    case 'ai_insight':
                      content = <AIInsightChip insight={value} />;
                      break;
                    case 'actions':
                      content = (
                        <div className="flex gap-1 items-center">
                          <ReviewButtons
                            claimId={row.original.claim_id}
                            status={row.original.status}
                            addToast={addToast}
                          />
                          <NotesPanel claimId={row.original.claim_id} addToast={addToast} />
                          <AuditTrailPopover claimId={row.original.claim_id} />
                        </div>
                      );
                      break;
                    default:
                      content = flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      );
                  }
                  return (
                    <td key={cell.id} className="px-2 py-1">
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
        </div>
        <div className="relative">
          <Button variant="secondary" size="sm" onClick={() => setExportOpen((o) => !o)}>
            Export
          </Button>
          {exportOpen && (
            <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg z-10">
              <button
                className="block px-3 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                onClick={() => exportRows('csv')}
              >
                CSV
              </button>
              <button
                className="block px-3 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                onClick={() => exportRows('json')}
              >
                JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ClaimListTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      accessorKey: PropTypes.oneOf([
        'claim_id',
        'provider_name',
        'cpt_summary',
        'claim_type',
        'status',
        'total_amount',
        'flagged_issues',
        'assignee',
        'ai_insight',
        'actions',
      ]).isRequired,
      header: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      cell: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      claim_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      provider_name: PropTypes.string.isRequired,
      cpt_summary: PropTypes.string,
      claim_type: PropTypes.string,
      status: PropTypes.string,
      total_amount: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      flagged_issues: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      assignee: PropTypes.string,
      ai_insight: PropTypes.string,
      notes: PropTypes.arrayOf(PropTypes.string),
      audit: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
};
