import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

test('product switcher preserves query params and time filters', () => {
  sessionStorage.setItem('claimsQuery', '?status=open&from=1&to=2&page=3');
  render(
    <MemoryRouter initialEntries={["/analytics?view=chart"]}>
      <Navbar tenant="t" role="admin" />
    </MemoryRouter>
  );
  const link = screen.getByTitle('Switch product');
  expect(link.getAttribute('href')).toBe('/claims?status=open&from=1&to=2&page=3');
});
