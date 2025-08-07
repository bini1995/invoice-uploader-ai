import { renderHook, act } from '@testing-library/react';
import useClaimActions from '../useClaimActions';

beforeEach(() => {
  localStorage.setItem('role', 'admin');
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test('allowed actions by role and status', () => {
  const { result } = renderHook(() => useClaimActions('1', 'Extracted'));
  expect(result.current.canApprove).toBe(true);
  expect(result.current.canRequestInfo).toBe(true);
  expect(result.current.canEscalate).toBe(true);
});

test('idempotency headers included', async () => {
  const { result } = renderHook(() => useClaimActions('1', 'Extracted'));
  await act(async () => {
    await result.current.approve();
  });
  const headers = fetch.mock.calls[0][1].headers;
  expect(headers['Idempotency-Key']).toBeTruthy();
  expect(headers['X-Request-ID']).toBe(headers['Idempotency-Key']);
});
