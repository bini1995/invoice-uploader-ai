import { render, screen } from '@testing-library/react';
import ClaimListTable from '../components/ClaimListTable';

const columns = [
  { accessorKey: 'claim_id', header: 'Claim ID' },
  { accessorKey: 'claim_type', header: 'Claim Type' },
  { accessorKey: 'cpt_summary', header: 'CPT Summary' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'total_amount', header: 'Total Amount' },
  { accessorKey: 'provider_name', header: 'Provider Name' },
  { accessorKey: 'flagged_issues', header: 'Flagged Issues' },
  { accessorKey: 'assignee', header: 'Assigned To' },
  { accessorKey: 'ai_insight', header: 'AI Insight' },
  { accessorKey: 'actions', header: 'Actions' },
];

test('renders claim list table with claim-centric headers', () => {
  render(<ClaimListTable columns={columns} data={[]} />);
  columns.forEach(col => {
    expect(screen.getByRole('columnheader', { name: col.header })).toBeInTheDocument();
  });
});
