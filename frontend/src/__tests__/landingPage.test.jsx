import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../LandingPage';

describe('LandingPage', () => {
  test('has one H1, hero CTA, and how-it-works link', () => {
    render(<LandingPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const heroCta = document.getElementById('hero-cta');
    expect(heroCta).toHaveAccessibleName('Schedule a demo');
    expect(
      screen.getByRole('link', { name: /see how it works/i })
    ).toHaveAttribute('href', '#how-it-works');
  });
});
