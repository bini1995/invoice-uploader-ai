import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import HelpTooltip from '../HelpTooltip';

describe('HelpTooltip', () => {
  test('opens via keyboard and stores seen state', async () => {
    localStorage.clear();
    render(
      <I18nextProvider i18n={i18n}>
        <HelpTooltip term="overcoded" />
      </I18nextProvider>
    );
    const btn = screen.getByRole('button', { name: /overcoded/i });
    await userEvent.tab();
    expect(btn).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent(/billed CPT/i);
    const seen = JSON.parse(localStorage.getItem('glossarySeen'));
    expect(seen.overcoded).toBe(true);
  });
});
