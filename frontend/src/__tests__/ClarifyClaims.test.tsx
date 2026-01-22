import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ClarifyClaims from '../ClarifyClaims';
import { API_BASE } from '../api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../components/MainLayout', () => ({ children }) => <div>{children}</div>);
jest.mock('../components/StatCard', () => ({ title, value, onClick }) => (
  <div onClick={onClick}>
    <span>{title}</span>
    <span>{value}</span>
  </div>
));
jest.mock('../components/ui/Card', () => ({ Card: ({ children }) => <div>{children}</div> }));

beforeEach(() => {
  localStorage.setItem('token', 'test-token');
  jest.useFakeTimers().setSystemTime(new Date('2024-01-10T00:00:45Z'));
});

afterEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  jest.useRealTimers();
});

test('fetches metrics for range, allows drilldown and refetch', async () => {
  const metrics = {
    total: 3,
    flagged_rate: 2 / 3,
    avg_processing_hours: 28,
    status_counts: { Pending: 1, Approved: 1, Flagged: 1 },
  };
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(metrics) })
  );

  await act(async () => {
    render(<ClarifyClaims />);
  });

  const from7d = '2024-01-03T00:00:00.000Z';
  const to = '2024-01-10T00:00:00.000Z';
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE}/api/claims/metrics?from=${from7d}&to=${to}`,
    expect.any(Object)
  );

  const totalLabel = await screen.findByText('Total Claims');
  expect(totalLabel.nextSibling.textContent).toBe('3');
  const flaggedLabel = screen.getByText('% Flagged');
  expect(flaggedLabel.nextSibling.textContent).toBe('66.7%');

  fireEvent.click(flaggedLabel.parentElement);
  expect(mockNavigate).toHaveBeenCalledWith(
    `/claims?from=${encodeURIComponent(from7d)}&to=${encodeURIComponent(to)}&flagged=true`
  );

  fetch.mockClear();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '24h' } });
  const from24h = '2024-01-09T00:00:00.000Z';
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE}/api/claims/metrics?from=${from24h}&to=${to}`,
    expect.any(Object)
  );
});
