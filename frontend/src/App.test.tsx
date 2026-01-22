import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock graph component which uses ESM build incompatible with jest
jest.mock('react-force-graph-2d', () => () => null);
jest.mock('yjs', () => ({}));
jest.mock('y-websocket', () => ({ WebsocketProvider: function() {} }));
jest.mock('textarea-caret', () => () => ({ top: 0, left: 0 }));

test('renders login heading by default', () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
  const heading = screen.getByRole('heading', { name: 'ClarifyOps › ClarifyClaims' });
  expect(heading).toBeInTheDocument();
});

test('high contrast toggle is present', () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
  const toggle = screen.getByLabelText(/high contrast/i);
  expect(toggle).toBeInTheDocument();
});
