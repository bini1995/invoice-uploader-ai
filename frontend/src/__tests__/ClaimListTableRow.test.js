import { render, screen } from '@testing-library/react';
import ClaimListTable from '../components/ClaimListTable';

const columns = [
  { accessorKey: 'claim_id', header: 'Claim ID' },
  { accessorKey: 'flagged_issues', header: 'Flagged Issues' },
];

test('highlights rows with flagged issues', () => {
  const data = [
    { claim_id: 'CLM-1', provider_name: 'Dr. Smith', flagged_issues: 0 },
    { claim_id: 'CLM-2', provider_name: 'Dr. Jones', flagged_issues: 2 },
  ];
  render(<ClaimListTable columns={columns} data={data} />);

  const normalRow = screen.getByText('CLM-1').closest('tr');
  const flaggedRow = screen.getByText('CLM-2').closest('tr');

  expect(normalRow).not.toHaveClass('bg-red-50');
  expect(flaggedRow).toHaveClass('bg-red-50');
});
