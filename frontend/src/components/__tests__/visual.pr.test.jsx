import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import HeroSection from '../HeroSection';
import TopNavbar from '../TopNavbar';

test('hero snapshot light and dark', () => {
  const { asFragment, unmount } = render(
    <HeroSection onRequestDemo={() => {}} />
  );
  expect(asFragment()).toMatchSnapshot();
  unmount();
  document.documentElement.classList.add('dark');
  const { asFragment: darkFrag } = render(
    <HeroSection onRequestDemo={() => {}} />
  );
  expect(darkFrag()).toMatchSnapshot();
  document.documentElement.classList.remove('dark');
});

test('navbar snapshot light and dark', () => {
  const { asFragment, unmount } = render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <TopNavbar title="Test" />
      </I18nextProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
  unmount();
  document.documentElement.classList.add('dark');
  const { asFragment: darkFrag } = render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <TopNavbar title="Test" />
      </I18nextProvider>
    </MemoryRouter>
  );
  expect(darkFrag()).toMatchSnapshot();
  document.documentElement.classList.remove('dark');
});
