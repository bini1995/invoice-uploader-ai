import { render, screen } from '@testing-library/react';
import ClaimDetailModal from '../components/ClaimDetailModal';

const sampleClaim = {
  id: 1,
  invoice_number: 'CLM-001',
  date: '2024-01-01',
  amount: '150.00',
  vendor: 'Health Provider',
  approval_status: 'Pending',
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-03T00:00:00Z',
};

test('renders claim detail modal with claim-focused labels', () => {
  render(
    <ClaimDetailModal
      open={true}
      invoice={sampleClaim}
      onClose={() => {}}
      onUpdate={() => {}}
      token=""
    />
  );

  expect(screen.getByText('Claim #CLM-001')).toBeInTheDocument();
  expect(screen.getByText(/Service Date:/)).toBeInTheDocument();
  expect(screen.getByText(/Provider:/)).toBeInTheDocument();
  expect(screen.getByText(/Status:/)).toBeInTheDocument();
});
