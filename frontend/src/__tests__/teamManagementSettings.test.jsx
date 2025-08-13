import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TeamManagement from '../TeamManagement';
import { MemoryRouter } from 'react-router-dom';

const user = { id: 1, username: 'alice', role: 'adjuster' };

function mockFetch(responses) {
  global.fetch = jest.fn((url, opts) => {
    if (url.endsWith('/api/users')) return Promise.resolve({ ok: true, json: () => Promise.resolve([user]) });
    if (url.endsWith('/api/logs')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    if (url.endsWith('/api/settings') && (!opts || opts.method === 'GET')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(responses.settings) });
    }
    if (url.endsWith('/api/settings') && opts && opts.method === 'PATCH') {
      responses.settings.showRoleEmojis = JSON.parse(opts.body).showRoleEmojis;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(responses.settings) });
    }
    if (url.endsWith('/api/api-keys')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

describe('role emoji toggle', () => {
  beforeEach(() => {
    localStorage.setItem('token', 't');
    localStorage.setItem('role', 'admin');
  });
  beforeAll(() => {
    window.matchMedia = window.matchMedia || function () {
      return {
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
      };
    };
  });
  afterEach(() => {
    localStorage.clear();
  });

  test('toggle hides and persists', async () => {
    const responses = { settings: { showRoleEmojis: true, autoArchive:true, emailTone:'professional', csvSizeLimitMB:5, pdfSizeLimitMB:10 } };
    mockFetch(responses);
    const { unmount } = render(
      <MemoryRouter>
        <TeamManagement />
      </MemoryRouter>
    );
    expect(await screen.findByLabelText(/role: Adjuster/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Show role emojis'));
    fireEvent.click(screen.getByText('Save Settings'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/settings'), expect.objectContaining({ method: 'PATCH' })));
    expect(screen.queryByLabelText(/role: Adjuster/i)).not.toBeInTheDocument();
    unmount();
    mockFetch(responses);
    render(
      <MemoryRouter>
        <TeamManagement />
      </MemoryRouter>
    );
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.queryByLabelText(/role: Adjuster/i)).not.toBeInTheDocument();
  });
});
