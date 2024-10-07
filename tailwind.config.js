/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primaryMainDark: '#030F16',
        primaryMainLight: '#F4F5F6',
        headerDark: '#072435',
        headerLight: '#FFFFFF',
        sideNavDark: '#072435',
        sideNavLight: '#FFFFFF',
        tileBlack: '#061E2C',
        tileLight: '#FFFFFF',
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