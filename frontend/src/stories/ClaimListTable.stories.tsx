import ClaimListTable from '../components/ClaimListTable';
import { generateMockClaims } from '../mocks/mockClaims';

const columns = [
  { accessorKey: 'claim_id', header: 'Claim ID' },
  { accessorKey: 'provider_name', header: 'Provider Name' },
  { accessorKey: 'cpt_summary', header: 'CPT Summary' },
  { accessorKey: 'claim_type', header: 'Claim Type' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'total_amount', header: 'Total Amount' },
  { accessorKey: 'flagged_issues', header: 'Flagged Issues' },
];

export default {
  title: 'Claims/ClaimListTable',
  component: ClaimListTable,
};

export const Default = {
  render: () => (
    <ClaimListTable columns={columns} data={generateMockClaims(5)} />
  ),
};
