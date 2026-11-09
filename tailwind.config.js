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
        notion: {
          bg: {
            light: '#ffffff',
            dark: '#191919',
          },
          sidebar: {
            light: '#f7f7f5',
            dark: '#202020',
          },
          card: {
            light: '#ffffff',
            dark: '#252525',
          },
          border: {
            light: '#e9e9e8',
            dark: '#2f2f2f',
          },
          hover: {
            light: '#efefee',
            dark: '#2c2c2c',
          },
          text: {
            light: '#37352f',
            dark: '#e3e2de',
            mutedLight: '#787774',
            mutedDark: '#9b9a97',
          }
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace']
      }
    },
  },
  plugins: [],
}
