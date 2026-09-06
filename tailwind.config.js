/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Brand — single accent color: indigo
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',  // PRIMARY
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      spacing: {
        18: '4.5rem',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'xs':         '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'card':       '0 2px 8px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 8px 24px -4px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'modal':      '0 24px 64px -12px rgb(0 0 0 / 0.18)',
        'dropdown':   '0 8px 24px -4px rgb(0 0 0 / 0.12), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'glow-brand': '0 0 20px -3px rgba(79, 70, 229, 0.4)',
        'glow-rose':  '0 0 20px -3px rgba(244, 63, 94, 0.4)',
      },
      animation: {
        'shimmer':       'skeleton-shimmer 1.6s ease-in-out infinite',
        'float':         'float 4s ease-in-out infinite',
        'pulse-subtle':  'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':      'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':      'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':       'fadeIn 0.2s ease-out both',
      },
      keyframes: {
        'skeleton-shimmer': {
          '0%':   { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.82' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
