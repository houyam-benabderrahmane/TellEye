/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TellEye Brand
        maroon: {
          DEFAULT: '#6B1F1F',
          50:  '#FAF0F0',
          100: '#F2CECE',
          200: '#E49999',
          300: '#D46464',
          400: '#C43636',
          500: '#6B1F1F',
          600: '#5A1A1A',
          700: '#491515',
          800: '#380F0F',
          900: '#270A0A',
        },
        forest: {
          DEFAULT: '#2D6A3F',
          50:  '#EBF5EE',
          100: '#C5E3CC',
          200: '#9FD1AA',
          300: '#79BF88',
          400: '#52AD66',
          500: '#2D6A3F',
          600: '#265A36',
          700: '#1E4A2B',
          800: '#173A22',
          900: '#0F2A18',
        },
        amber: {
          telleye: '#E8941A',
          light:   '#F5B94E',
          dark:    '#C47A0E',
        },
        cream: '#F9F6F0',
        sage:  '#EAF2EB',
        charcoal: '#1C1C1C',
        // Traffic lights
        soil: {
          good:   '#2D9E5A',
          medium: '#E8941A',
          poor:   '#C0392B',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        arabic:  ['"Noto Sans Arabic"', 'sans-serif'],
      },
      backgroundImage: {
        'satellite-gradient': 'linear-gradient(135deg, #0A1A0A 0%, #1A2E1A 40%, #0D1F1D 100%)',
        'hero-overlay':       'linear-gradient(to bottom, rgba(10,20,10,0.7) 0%, rgba(10,20,10,0.85) 100%)',
        'maroon-gradient':    'linear-gradient(135deg, #6B1F1F 0%, #8B2E2E 100%)',
        'forest-gradient':    'linear-gradient(135deg, #2D6A3F 0%, #3D8A55 100%)',
        'amber-gradient':     'linear-gradient(135deg, #E8941A 0%, #F5B94E 100%)',
      },
      boxShadow: {
        'card':      '0 4px 20px rgba(0,0,0,0.08)',
        'card-hover':'0 12px 40px rgba(0,0,0,0.15)',
        'glow-amber':'0 0 30px rgba(232,148,26,0.3)',
        'glow-maroon':'0 0 30px rgba(107,31,31,0.3)',
        'glow-forest':'0 0 30px rgba(45,106,63,0.3)',
      },
      borderRadius: {
        card: '12px',
      },
      animation: {
        'scroll-x': 'scrollX 30s linear infinite',
        'float':    'float 6s ease-in-out infinite',
        'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scrollX: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}