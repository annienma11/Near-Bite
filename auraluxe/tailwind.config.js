/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFF9E6',
          100: '#FFF0B3',
          200: '#FFE680',
          300: '#FFD94D',
          400: '#FFCC1A',
          500: '#E6B800',
          600: '#CCA300',
          700: '#B38F00',
          800: '#997A00',
          900: '#806600',
        },
        brown: {
          50: '#FAF8F5',
          100: '#F0EBE3',
          200: '#E0D5C7',
          300: '#C9B8A3',
          400: '#A89176',
          500: '#8B7355',
          600: '#6B5744',
          700: '#4D3F2F',
          800: '#3A2F23',
          900: '#2A1F16',
        },
        cream: {
          50: '#FFFEF9',
          100: '#FFFCF0',
          200: '#FFF9E1',
          300: '#FFF5D1',
          400: '#FFF0B8',
          500: '#FFEB9F',
          600: '#F5E08C',
          700: '#E6D179',
          800: '#D4BF66',
          900: '#C2AD53',
        },
      },
    },
  },
  plugins: [],
};
