/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        'pastel-sky': '#BAE6FD',
        'pastel-green': '#86EFAC', 
        'pastel-yellow': '#FDE047',
        'pastel-orange': '#FDBA74',
        'pastel-violet': '#C4B5FD',
      }
    },
  },
  plugins: [],
}