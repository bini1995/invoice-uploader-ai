import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuditTrailPopover from '../AuditTrailPopover';

test('caches audit logs between opens', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [], total: 0 }) })
  );
  render(<AuditTrailPopover claimId="1" />);
  const btn = screen.getByRole('button', { name: /audit/i });
  fireEvent.mouseEnter(btn);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  fireEvent.mouseLeave(btn);
  fireEvent.mouseEnter(btn);
  expect(fetch).toHaveBeenCalledTimes(1);
});
