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
        // Design tokens del tema (Stitch)
        stitch: {
          DEFAULT: '#0a0a0b',
          bg: '#08080a',
          surface: '#121216',
          'surface-alt': '#1a1a20',
          border: '#26262e',
          muted: '#8a8a95',
          subtle: '#55555f',
          ink: '#f5f5f7',
          accent: '#e62429',
          'accent-soft': '#ff5c5c',
          gold: '#f5c542',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // Space Grotesk es la display/heading principal del tema Stitch.
        display: ['Space Grotesk', 'Archivo Black', 'Archivo', 'Impact', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        label: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        anton: ['Anton', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'Times', 'serif'],
      },
      // Espaciado vertical de las secciones del home.
      spacing: {
        section: '5.5rem',
        'section-lg': '9rem',
        gutter: '1.25rem',
      },
      // Escala tipográfica display del tema.
      fontSize: {
        kicker: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.4em' }],
        'display-xs': ['2.25rem', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-sm': ['3.25rem', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        display: ['4.5rem', { lineHeight: '0.9', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(3rem, 10vw, 9rem)', { lineHeight: '0.82', letterSpacing: '-0.04em' }],
      },
      maxWidth: {
        shell: '80rem',
      },
    },
  },
  plugins: [],
}
