// frontend/tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: colors.indigo,
      },
    },
  },
  plugins: [],
};
  