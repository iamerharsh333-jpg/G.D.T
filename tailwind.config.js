/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        twin: {
          bg: '#0a0d14',
          panel: '#0f172a',
          card: '#131e36',
          border: '#1e293b',
          accent: '#06b6d4', // cyan-500
          accentHover: '#0891b2',
          glow: '#38bdf8',
          textMuted: '#94a3b8',
          textBright: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}

