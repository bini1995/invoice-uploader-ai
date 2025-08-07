import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClaimsPage from '../Claims';

// Mock external libraries and heavy components
jest.mock('socket.io-client', () => ({ io: () => ({ on: jest.fn(), emit: jest.fn(), disconnect: jest.fn(), off: jest.fn() }) }));

jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  CartesianGrid: () => null,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
}));

jest.mock('framer-motion', () => ({ motion: { tr: (props) => <tr {...props} />, div: (props) => <div {...props} /> } }));

jest.mock('../components/LiveFeed', () => () => null);
jest.mock('../components/Navbar', () => () => null);
jest.mock('../components/SidebarNav', () => () => null);
jest.mock('../components/PageHeader', () => () => null);
jest.mock('../components/ChatSidebar', () => () => null);
jest.mock('../components/GraphView', () => () => null);
jest.mock('../components/ConfirmModal', () => () => null);
jest.mock('../components/SuggestionChips', () => () => null);
jest.mock('../components/PreviewModal', () => () => null);
jest.mock('../components/VendorProfilePanel', () => () => null);
jest.mock('../components/BulkSummary', () => () => null);
jest.mock('../components/ActionToolbar', () => () => null);
jest.mock('../components/AIAssistantPanel', () => () => null);
jest.mock('../components/InvoiceSnapshotView', () => () => null);
jest.mock('../components/SuccessAnimation', () => () => null);
jest.mock('../components/WelcomeModal', () => () => null);
jest.mock('../components/UpgradePrompt', () => () => null);
jest.mock('../components/ProgressBar', () => () => null);
jest.mock('../components/FeatureWidget', () => () => null);
jest.mock('../components/ExplanationModal', () => () => null);
jest.mock('../components/FlaggedBadge', () => () => null);
jest.mock('../components/CollaborativeCommentInput', () => () => null);

jest.mock('react-joyride', () => () => null);

beforeEach(() => {
  localStorage.setItem('token', 'test');
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
});

afterEach(() => {
  localStorage.clear();
});

test('renders claim-focused table headers and upload prompts', async () => {
  render(
    <MemoryRouter>
      <ClaimsPage />
    </MemoryRouter>
  );

  expect(await screen.findByRole('columnheader', { name: 'Claim Type' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'CPT Summary' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Total Amount' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Provider Name' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Flagged Issues' })).toBeInTheDocument();

  expect(await screen.findByText('No recent claims found')).toBeInTheDocument();
  expect(screen.getByText('Upload a new one to begin extraction.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit Claims Document' })).toBeInTheDocument();
  expect(screen.getByText('Drag EOB / CMS-1500 here or tap to select or capture')).toBeInTheDocument();
});
