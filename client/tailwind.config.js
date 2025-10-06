/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
        },
        yellow: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        gibson: ['Poppins', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        dairy: ['Dancing Script', 'Brush Script MT', 'cursive', 'serif'],
      },
    },
  },
  plugins: [],
}