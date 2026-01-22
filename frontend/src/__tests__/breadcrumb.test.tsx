import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

test('deep link renders full breadcrumb trail', () => {
  render(
    <MemoryRouter initialEntries={["/claims/123/audit/note"]}>
      <Navbar tenant="t" role="admin" />
    </MemoryRouter>
  );
  const crumb = screen.getByText('ClarifyClaims').parentElement;
  expect(crumb.textContent).toMatch(/ClarifyClaims.*Claim 123.*Audit.*Note/);
});
