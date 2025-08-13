import { render, screen } from '@testing-library/react';
import ClaimListTable from '../components/ClaimListTable';

global.innerWidth = 375;

const columns = [
  { accessorKey: 'claim_id', header: 'Claim ID' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'assignee', header: 'Assignee' },
  { accessorKey: 'updated_at', header: 'Last Update' },
];

test('renders mobile card with status, assignee and last update', () => {
  const data = [
    {
      claim_id: 'CLM-1',
      status: 'Pending',
      assignee: 'Alice',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];
  render(<ClaimListTable columns={columns} data={data} />);
  expect(screen.getByText(/Claim ID: CLM-1/)).toBeInTheDocument();
  expect(screen.getByText('Pending')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument();
  expect(screen.getByText(/2024/)).toBeInTheDocument();
});
