/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        eclipse: {
          dark: {
            bg: '#000000',
            surface: '#1A1A1A',
            text: '#FFFFFF',
            muted: 'rgba(255,255,255,0.4)',
            border: 'rgba(255,255,255,0.08)',
          },
          light: {
            bg: '#F9F9F9',
            surface: '#E5E5E5',
            text: '#000000',
            muted: 'rgba(0,0,0,0.4)',
            border: 'rgba(0,0,0,0.06)',
          },
        },
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366F1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
        accent: {
          cyan: {
            DEFAULT: '#00F0FF',
            light: '#0EA5E9',
          },
          purple: {
            DEFAULT: '#A855F7',
            light: '#9333EA',
          },
          green: {
            DEFAULT: '#10B981',
            light: '#059669',
          },
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      textShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.15)',
        DEFAULT: '0 2px 4px rgba(0,0,0,0.2)',
        lg: '0 4px 8px rgba(0,0,0,0.3)',
        glow: '0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.05)',
        cyan: '0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.2)',
        purple: '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)',
      },
      backgroundImage: {
        'gradient-cyan-purple': 'linear-gradient(135deg, #00F0FF, #A855F7)',
        'gradient-purple-cyan': 'linear-gradient(135deg, #A855F7, #00F0FF)',
      },
      animation: {
        loading: 'loading 1.5s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        loading: {
          '0%': { width: '0%', marginLeft: '0%' },
          '50%': { width: '100%', marginLeft: '0%' },
          '100%': { width: '0%', marginLeft: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.whitespace-nowrap': { 'white-space': 'nowrap' },
        '.text-shadow-sm': { 'text-shadow': '0 1px 2px rgba(0,0,0,0.15)' },
        '.text-shadow': { 'text-shadow': '0 2px 4px rgba(0,0,0,0.2)' },
        '.text-shadow-lg': { 'text-shadow': '0 4px 8px rgba(0,0,0,0.3)' },
        '.text-shadow-glow': { 'text-shadow': '0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.05)' },
        '.text-shadow-glow-dark': { 'text-shadow': '0 0 40px rgba(255,255,255,0.2), 0 0 80px rgba(255,255,255,0.1)' },
        '.text-shadow-cyan': { 'text-shadow': '0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.2)' },
        '.text-shadow-purple': { 'text-shadow': '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)' },
      })
    }
  ],
}
