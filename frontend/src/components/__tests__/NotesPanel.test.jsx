import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import NotesPanel from '../NotesPanel';

test('optimistic add with rollback on failure', async () => {
  global.fetch = jest.fn((url, opts) => {
    if (opts) {
      return Promise.resolve({ ok: false, text: () => Promise.resolve('fail') });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
  const addToast = jest.fn();
  render(<NotesPanel claimId="1" addToast={addToast} />);
  fireEvent.click(screen.getByRole('button', { name: /notes/i }));
  await waitFor(() => screen.getByRole('dialog'));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
  fireEvent.click(screen.getByRole('button', { name: /add/i }));
  await waitFor(() => expect(addToast).toHaveBeenCalled());
  const list = screen.getByRole('list');
  expect(within(list).queryByText('test')).not.toBeInTheDocument();
});
