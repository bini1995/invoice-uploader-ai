import React, { useEffect } from 'react';
import StatusChip from '../components/StatusChip';

const ThemeWrap = ({ theme, accent, children }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.setProperty('--cta-bg', accent);
    document.documentElement.style.setProperty('--cta-hover', accent);
    document.documentElement.style.setProperty('--cta-active', accent);
    document.documentElement.style.setProperty('--focus-ring-color', accent);
  }, [theme, accent]);
  return <div className="p-4 space-y-4 bg-surface text-ink">{children}</div>;
};

export default {
  title: 'Design/Tokens',
  render: (args) => (
    <ThemeWrap {...args}>
      <button className="btn btn-primary">Primary Button</button>
      <div className="flex gap-2">
        <StatusChip status="Extracted" />
        <StatusChip status="Needs Review" />
        <StatusChip status="Approved" />
        <StatusChip status="Flagged" />
      </div>
      <div className="card">Card surface</div>
    </ThemeWrap>
  ),
  argTypes: {
    theme: { control: { type: 'inline-radio' }, options: ['light', 'dark'] },
    accent: { control: 'color' },
  },
  args: { theme: 'light', accent: '#059669' },
};
