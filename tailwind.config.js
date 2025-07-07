/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        gray: {
          950: '#0a0a0a',
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          100: '#f3f4f6',
        },
        blue: {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        green: {
          600: '#16a34a',
          700: '#15803d',
        },
        emerald: {
          600: '#059669',
          700: '#047857',
        },
        purple: {
          600: '#9333ea',
          700: '#7e22ce',
        },
      },
    },
  },
  plugins: [],
};
