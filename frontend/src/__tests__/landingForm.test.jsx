import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LandingPage from '../LandingPage';

describe('landing form', () => {
  afterEach(() => {
    global.fetch && global.fetch.mockClear();
  });

  test('shows validation error for bad email', async () => {
    global.fetch = jest.fn();
    render(<LandingPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'bad' } });
    const form = screen.getByText(/request demo/i).closest('form');
    fireEvent.submit(form);
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
  });

  test('handles server error', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    render(<LandingPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByText(/request demo/i));
    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
  });

  test('shows success state', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
    render(<LandingPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByText(/request demo/i));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/thanks/i));
  });
});
