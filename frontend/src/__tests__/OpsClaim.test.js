import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OpsClaim from '../OpsClaim';
import { mockAuditLogs } from '../mocks/mockAuditLogs';

jest.mock('../components/ChatSidebar', () => () => <div />);
jest.mock('../components/MainLayout', () => ({ children }) => <div>{children}</div>);
jest.mock('../components/Skeleton', () => ({ children }) => <div>{children}</div>);

beforeEach(() => {
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('tenant', 'default');
});

afterEach(() => {
  jest.resetAllMocks();
});

test('audit trail popover fetches and displays log data', async () => {
  const invoice = {
    id: 1,
    invoice_number: 'INV-001',
    vendor: 'Vendor A',
    amount: 100,
    approval_status: 'Pending',
    flagged_issues: 0,
  };

  global.fetch = jest.fn((url) => {
    if (url.includes('/api/audit')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAuditLogs) });
    }
    if (url.includes('/api/default/invoices?status=Pending')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([invoice]) });
    }
    return Promise.reject(new Error('unknown url'));
  });

  render(<OpsClaim />);

  expect(await screen.findByText('INV-001')).toBeInTheDocument();
  const auditBtn = screen.getByTitle('Audit Trail');
  fireEvent.mouseEnter(auditBtn);
  await waitFor(() => {
    expect(screen.getByText(/Created invoice/)).toBeInTheDocument();
  });
});
