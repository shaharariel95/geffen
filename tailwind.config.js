/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material-3 inspired primary - vibrant and poppy
        primary: {
          DEFAULT: '#6750A4',
          '600': '#7C4DFF',
          '700': '#5B21B6'
        }
      },
      borderRadius: {
        // Slightly larger radii for Material 3-like components
        'm3': '1rem',
        'm3-lg': '1.5rem'
      }
    },
  },
  plugins: [],
}