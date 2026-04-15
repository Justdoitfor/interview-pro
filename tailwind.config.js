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
        sans: ['"Noto Sans"', 'Inter', 'sans-serif'],
        display: ['"Roobert PRO"', '"Roobert PRO Medium"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        miro: {
          black: '#1c1c1e',
          blue: '#5b76fe',
          bluePressed: '#2a41b6',
          success: '#00b473',
          border: '#c7cad5',
          placeholder: '#a5a8b5',
          slate: '#555a6a',
        },
        pastel: {
          coral: { light: '#ffc6c6', dark: '#600000' },
          rose: { light: '#ffd8f4' },
          teal: { light: '#c3faf5', dark: '#187574' },
          orange: { light: '#ffe6cd' },
          yellow: { dark: '#746019' },
          moss: { dark: '#187574' },
          pink: { soft: '#fde0f0' },
          red: { light: '#fbd4d4', dark: '#e3c5c5' },
        },
        slate: {
          950: '#0a0a0a',
          900: '#121212',
          800: '#1e1e1e',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#525252',
          400: '#737373',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#e5e5e5',
          50: '#fafafa',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        blue: {
          500: '#3b82f6',
        }
      },
      boxShadow: {
        'ring': 'rgb(224, 226, 232) 0px 0px 0px 1px',
        'ring-blue': 'rgb(91, 118, 254) 0px 0px 0px 1px',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')",
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
