import { render, screen } from '@testing-library/react';
import App from './App';

// Mock graph component which uses ESM build incompatible with jest
jest.mock('react-force-graph-2d', () => () => null);

test('renders login heading by default', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /login/i });
  expect(heading).toBeInTheDocument();
});
