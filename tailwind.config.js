/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      // Escala de grises propia inspirada en DeviantArt (tonos neutros).
      colors: {
        ink: {
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#d8d8d8',
          300: '#c2c2c2',
          400: '#a8a8a8',
          500: '#8f8f8f',
          600: '#737373',
          700: '#5a5a5a',
          800: '#2f2f2f',
          900: '#161616',
          950: '#0a0a0a',
        },
        // Rojo Marvel como acento principal
        marvel: {
          50: '#ffeaea',
          100: '#ffdddd',
          200: '#ffbfbf',
          300: '#ff9696',
          400: '#ff5c5c',
          500: '#e62429',
          600: '#cc1f23',
          700: '#b01a1e',
          800: '#8f1418',
          900: '#6b0f12',
        },
        // Neutros editoriales tipo INC
        editorial: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Archivo Black', 'Archivo', 'Impact', 'Haettenschweiler', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        anton: ['Anton', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
}
