/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: '#6B1F1F',
        forest: '#2D6A3F',
        amber: {
          300: '#fcd34d',
          400: '#E8941A',
          500: '#d97706',
          DEFAULT: '#E8941A',
          telleye: '#E8941A',
        },
        cream: '#F9F6F0',
        charcoal: '#1C1C1C',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}