/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      // Escala de grises propia inspirada en DeviantArt (tonos neutros).
      colors: {
        ink: {
          50: '#e7e9ea',
          100: '#d0d3d6',
          200: '#a9adb3',
          300: '#8a8f96',
          400: '#6e737a',
          500: '#565a61',
          600: '#41444c',
          700: '#30333a',
          800: '#242629',
          900: '#1c1e21',
          950: '#17181a',
        },
        // Azul cian acento estilo DeviantArt, usado en hovers y bordes.
        da: {
          300: '#a5fbfb',
          400: '#13f2f2',
          500: '#0fd0d0',
          600: '#0ba3a3',
        },
      },
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        anton: ['Anton', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
