// frontend/tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"InterVariable"', 'Inter', '"Work Sans"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: colors.indigo,
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      boxShadow: {
        'xl-deep': '0 35px 60px -15px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
  