/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      // Escala de grises propia: negro profundo a blanco puro.
      colors: {
        ink: {
          50: '#f5f5f5',
          100: '#d4d4d4',
          200: '#a3a3a3',
          300: '#737373',
          400: '#404040',
          500: '#2a2a2a',
          600: '#1f1f1f',
          700: '#161616',
          800: '#111111',
          900: '#0a0a0a',
          950: '#050505',
        },
      },
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
