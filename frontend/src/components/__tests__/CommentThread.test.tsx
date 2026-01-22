import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import useSWR from 'swr';
import CommentThread from '../CommentThread';

jest.mock('swr');

afterEach(() => {
  jest.resetAllMocks();
});

test('optimistic add with rollback on failure', async () => {
  const mutate = jest.fn();
  useSWR.mockReturnValue({ data: { comments: [] }, error: null, isLoading: false, mutate });
  global.fetch = window.fetch = jest.fn(() =>
    Promise.resolve({ ok: false, text: () => Promise.resolve('fail'), headers: { get: () => '' } })
  );
  render(<CommentThread claimId="1" token="t" />);
  const box = screen.getByPlaceholderText(/add comment/i);
  fireEvent.change(box, { target: { value: 'hey' } });
  fireEvent.keyDown(box, { key: 'Enter', ctrlKey: true });
  await waitFor(() => expect(mutate).toHaveBeenCalled());
  expect(screen.getByText('No comments yet')).toBeInTheDocument();
});

test('snapshot threaded conversation', () => {
  useSWR.mockReturnValue({
    data: {
      comments: [
        { id: 1, parent_id: null, depth: 0, text: 'top' },
        { id: 2, parent_id: 1, depth: 1, text: 'reply' },
      ],
    },
    error: null,
    isLoading: false,
    mutate: jest.fn(),
  });
  const { container } = render(<CommentThread claimId="1" token="t" />);
  expect(container).toMatchSnapshot();
});

test('has ARIA roles and labels', () => {
  useSWR.mockReturnValue({
    data: { comments: [{ id: 1, parent_id: null, depth: 0, text: 'hi' }] },
    error: null,
    isLoading: false,
    mutate: jest.fn(),
  });
  render(<CommentThread claimId="1" token="t" />);
  expect(screen.getByRole('list', { name: /comments/i })).toBeInTheDocument();
  expect(screen.getByLabelText('Reply to comment 1')).toBeInTheDocument();
});
