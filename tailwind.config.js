/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          sidebar: '#101D4B',
          heading: '#142653',
          dark: '#0B1536',
          hover: '#1B2A5E',
          subtle: '#22356B'
        },
        brand: {
          purple: '#563CF0',
          hover: '#472FD6',
          violet: '#7545F5',
          lightPurple: '#F0EEFF',
          lavender: '#EDE9FE',
          bg: '#F2F5FD',
        },
        crew: {
          border: '#DFE5F2',
          subtleBorder: '#E8EEF8',
          textMuted: '#5F6D82',
          textSubtle: '#64748B',
          card: '#FFFFFF',
          tagBg: '#F3F4F8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(16, 29, 75, 0.04), 0 1px 3px rgba(16, 29, 75, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(16, 29, 75, 0.08), 0 4px 10px -2px rgba(16, 29, 75, 0.04)',
        'btn': '0 4px 14px 0 rgba(86, 60, 240, 0.35)',
      }
    },
  },
  plugins: [],
}

