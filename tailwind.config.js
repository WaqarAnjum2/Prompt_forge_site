/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FBEFEF',
          surface: '#FFE2E2',
          elevated: '#F5CBCB',
        },
        brand: {
          light: '#D4C4E0',
          DEFAULT: '#C5B3D3',
          dark: '#9B7DB0',
        },
        ink: {
          DEFAULT: '#1F2937',
          soft: '#6B7280',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        hero: ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h1: ['48px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h2: ['32px', { lineHeight: '1.2' }],
        h3: ['24px', { lineHeight: '1.25' }],
        body: ['16px', { lineHeight: '1.5' }],
        caption: ['12px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'fade-down': 'fadeDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
