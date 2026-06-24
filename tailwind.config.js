/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070512',
          900: '#0c0820',
          850: '#110a2b',
          800: '#170f38',
          700: '#1f1745',
          600: '#2a2057',
        },
        aura: {
          50: '#fdf2ff',
          100: '#fae4ff',
          200: '#f5c7ff',
          300: '#ee9bff',
          400: '#e164ff',
          500: '#c93df0',
          600: '#a620cf',
          700: '#851aa6',
          800: '#6b1684',
          900: '#561467',
        },
        neon: {
          pink: '#ff3df1',
          blue: '#3df0ff',
          violet: '#8b5cff',
          cyan: '#22ffe0',
        },
        champagne: '#f4e8c1',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'aura-glow': '0 0 30px -8px rgba(233, 100, 255, 0.55), 0 0 80px -20px rgba(61, 240, 255, 0.35)',
        'aura-soft': '0 0 20px -10px rgba(233, 100, 255, 0.45)',
        'neon-pink': '0 0 24px -6px rgba(255, 61, 241, 0.7)',
        'neon-blue': '0 0 24px -6px rgba(61, 240, 255, 0.7)',
      },
      backgroundImage: {
        'aura-radial': 'radial-gradient(circle at 20% 20%, rgba(201,61,240,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(61,240,255,0.12), transparent 50%), radial-gradient(circle at 50% 100%, rgba(139,92,255,0.14), transparent 55%)',
        'aura-grid': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'blur(40px)' },
          '50%': { opacity: '1', filter: 'blur(50px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'aura-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'aura-rotate': 'aura-rotate 20s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
