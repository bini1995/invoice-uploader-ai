import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

let ReviewButtons;

describe('ReviewButtons', () => {
  beforeEach(() => {
    localStorage.setItem('role', 'adjuster');
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    window.confirm = jest.fn(() => true);
    vi.stubEnv('VITE_REVIEW_ACTIONS', 'true');
    ReviewButtons = require('../ReviewButtons').default;
  });

  it('calls approve endpoint', async () => {
    render(<ReviewButtons claimId="1" status="Extracted" />);
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it('disables for unauthorized role', () => {
    localStorage.setItem('role', 'viewer');
    render(<ReviewButtons claimId="1" status="Extracted" />);
    expect(screen.getByRole('button', { name: /approve/i })).toBeDisabled();
  });

  it('asks for confirmation on escalate', () => {
    localStorage.setItem('role', 'auditor');
    render(<ReviewButtons claimId="1" status="Extracted" />);
    fireEvent.click(screen.getByRole('button', { name: /escalate/i }));
    expect(window.confirm).toHaveBeenCalled();
  });
});
