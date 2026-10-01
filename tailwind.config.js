/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fa: ['"Vazirmatn"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#C8A951',
          light: '#E0CC7E',
          dark: '#A68B3D',
        },
        'royal-blue': {
          DEFAULT: '#1A2744',
          light: '#243556',
          dark: '#0F1A2E',
        },
        burgundy: {
          DEFAULT: '#8B2335',
          light: '#A52F42',
        },
        cream: {
          DEFAULT: '#FAF6EE',
          dark: '#F0E8D8',
        },
        stone: {
          DEFAULT: '#D4C5A9',
          light: '#E8DEC8',
        },
        bronze: '#7B6840',
        'text-dark': '#2D1F14',
        'text-medium': '#5C4A36',
        'text-light': '#8A7B6A',
        'card-bg': '#FFFDF7',
        border: '#D4C5A9',
      },
    },
  },
  plugins: [],
}
