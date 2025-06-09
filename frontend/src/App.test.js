import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /invoice uploader/i });
  expect(heading).toBeInTheDocument();
});
