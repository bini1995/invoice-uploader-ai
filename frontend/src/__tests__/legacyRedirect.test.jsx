import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import LegacyClaimsRedirect from '../LegacyClaimsRedirect';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search + location.hash}</div>;
}

test('redirect preserves query and hash', () => {
  render(
    <MemoryRouter initialEntries={['/opsclaim?foo=bar#baz']}>
      <Routes>
        <Route path="/opsclaim/*" element={<LegacyClaimsRedirect />} />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByTestId('location').textContent).toBe('/claims?foo=bar#baz');
});
