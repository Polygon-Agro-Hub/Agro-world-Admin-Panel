/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primaryMain: '#030F16',
        tileBack: '#061E2C',
        tileHover: '#14557C',
        navText:'#061E2C',
        darkModeBg: '#1a202c', // Custom background color for dark mode
        darkModeText: '#DFDFDF',
        lightModeText: '#a0aec0', // Custom text color for dark mode
      }
    },
  },
  plugins: [],
}