import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotesModal from '../NotesModal';
import { mockReviewNotes } from '../../mocks/mockReviewNotes';

beforeEach(() => {
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('tenant', 'default');
});

afterEach(() => {
  jest.resetAllMocks();
});

test('loads and posts notes correctly', async () => {
  const invoice = { id: 1, invoice_number: 'INV-001' };
  let notes = [...mockReviewNotes];
  global.fetch = jest.fn((url, options = {}) => {
    if (url.includes('/review-notes')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        notes.push({ id: notes.length + 1, note: body.note, created_at: '2024-01-02T00:00:00Z' });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ notes }) });
    }
    return Promise.reject(new Error('unknown url'));
  });

  render(<NotesModal invoice={invoice} open={true} onClose={() => {}} />);

  expect(await screen.findByText('Initial note')).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Add a note'), {
    target: { value: 'Another note' },
  });
  fireEvent.click(screen.getByText('Add'));
  await waitFor(() => {
    expect(screen.getByText('Another note')).toBeInTheDocument();
  });
});
