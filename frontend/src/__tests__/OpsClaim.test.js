import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OpsClaim from '../OpsClaim';
import { mockAuditLogs } from '../mocks/mockAuditLogs';
import { API_BASE } from '../api';

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
  const claim = {
    id: 1,
    claim_number: 'CLM-001',
    vendor: 'Vendor A',
    amount: 100,
    approval_status: 'Pending',
    flagged_issues: 0,
  };

  global.fetch = jest.fn((url) => {
    if (url.includes('/api/audit')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAuditLogs) });
    }
    if (url.includes('/api/default/claims?status=Pending')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([claim]) });
    }
    return Promise.reject(new Error('unknown url'));
  });

  render(
    <MemoryRouter initialEntries={['/opsclaim']}>
      <OpsClaim />
    </MemoryRouter>
  );

  expect(await screen.findByText('CLM-001')).toBeInTheDocument();
  const auditBtn = screen.getByTitle('Audit Trail');
  fireEvent.mouseEnter(auditBtn);
  await waitFor(() => {
    expect(screen.getByText(/Created invoice/)).toBeInTheDocument();
  });
});

test('applies flagged filter from query string', async () => {
  const claims = [
    {
      id: 1,
      claim_number: 'CLM-001',
      vendor: 'Vendor A',
      amount: 100,
      approval_status: 'Pending',
      flagged: true,
      flagged_issues: 0,
    },
    {
      id: 2,
      claim_number: 'CLM-002',
      vendor: 'Vendor B',
      amount: 50,
      approval_status: 'Pending',
      flagged: false,
      flagged_issues: 0,
    },
  ];

  global.fetch = jest.fn((url) => {
    if (url.includes('/api/default/claims?status=Pending')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(claims) });
    }
    return Promise.reject(new Error('unknown url'));
  });

  render(
    <MemoryRouter initialEntries={['/opsclaim?flagged=true']}>
      <OpsClaim />
    </MemoryRouter>
  );

  expect(await screen.findByText('CLM-001')).toBeInTheDocument();
  expect(screen.queryByText('CLM-002')).toBeNull();
});

test('includes from/to parameters when present', async () => {
  const claim = {
    id: 1,
    claim_number: 'CLM-001',
    vendor: 'Vendor A',
    amount: 100,
    approval_status: 'Pending',
    flagged_issues: 0,
  };
  const from = '2024-01-03T00:00:00.000Z';
  const to = '2024-01-10T00:00:00.000Z';

  global.fetch = jest.fn((url) => {
    if (
      url ===
      `${API_BASE}/api/default/claims?status=Pending&from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}`
    ) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([claim]) });
    }
    return Promise.reject(new Error('unknown url'));
  });

  render(
    <MemoryRouter
      initialEntries={[`/opsclaim?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`]}
    >
      <OpsClaim />
    </MemoryRouter>
  );

  expect(await screen.findByText('CLM-001')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE}/api/default/claims?status=Pending&from=${encodeURIComponent(
      from
    )}&to=${encodeURIComponent(to)}`,
    expect.any(Object)
  );
});
