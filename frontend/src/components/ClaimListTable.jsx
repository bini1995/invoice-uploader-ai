import React, { useState } from 'react';
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

export default function ClaimListTable({ columns, data }) {
  const [sorting, setSorting] = useState([]);
  const [columnSizing, setColumnSizing] = useState({});
  const [exportOpen, setExportOpen] = useState(false);

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
    <div className="space-y-2">
      <div className="overflow-x-auto">
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
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-1">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    })
  ).isRequired,
};
