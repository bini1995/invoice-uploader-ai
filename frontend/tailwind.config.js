// frontend/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ui)'],
        heading: ['var(--font-heading)'],
      },
      colors: {
        surface: 'var(--bg-surface)',
        ink: 'var(--text-default)',
        muted: 'var(--text-muted)',
        border: 'var(--border-default)',
        accent: {
          DEFAULT: 'var(--cta-bg)',
          hover: 'var(--cta-hover)',
          active: 'var(--cta-active)',
        },
        status: {
          neutral: 'var(--status-neutral)',
          amber: 'var(--status-amber)',
          green: 'var(--status-green)',
          red: 'var(--status-red)',
        },
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        e1: 'var(--shadow-e1)',
        e2: 'var(--shadow-e2)',
        e3: 'var(--shadow-e3)',
        'xl-deep': '0 35px 60px -15px rgba(0,0,0,0.5)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        medium: 'var(--motion-medium)',
        modal: 'var(--motion-modal)',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'var(--motion-ease-out)',
        'ease-in-out-custom': 'var(--motion-ease-in-out)',
      },
      ringColor: {
        focus: 'var(--focus-ring-color)',
      },
      ringWidth: {
        focus: 'var(--focus-ring-width)',
      },
      ringOffsetWidth: {
        focus: 'var(--focus-ring-offset)',
      },
    },
  },
  plugins: [],
};
  