/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcfe',
          300: '#a3c4fd',
          400: '#75a3fb',
          500: '#467df7',
          600: '#2b5ff0',
          700: '#1e48dc',
          800: '#1e3cb2',
          900: '#1d368d',
          950: '#142257',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 14px 40px 0 rgba(31, 38, 135, 0.12)',
        'glow-primary': '0 0 20px -3px rgba(59, 130, 246, 0.4)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.4)',
        'glow-purple': '0 0 20px -3px rgba(168, 85, 247, 0.4)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          'from': { backgroundPosition: '200% 0' },
          'to': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
