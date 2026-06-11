/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pressstart: ['NeoDunggeunmo', '"Press Start 2P"', 'monospace'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        poke: {
          dark: '#080a0f',
          card: '#121620',
          panel: 'rgba(18, 22, 32, 0.9)',
          border: '#2e3440',
          yellow: '#ffcc01',
          blue: '#0a7abc',
          bg: '#040711',
        },
        type: {
          normal: '#A8A77A',
          fire: '#EE8130',
          water: '#6390F0',
          electric: '#F7D02C',
          grass: '#7AC74C',
          ice: '#96D9D6',
          fighting: '#C22E28',
          poison: '#A33EA1',
          ground: '#E2BF65',
          flying: '#A98FF3',
          psychic: '#F95587',
          bug: '#A6B91A',
          rock: '#B6A136',
          ghost: '#735797',
          dragon: '#6F35FC',
          dark: '#705746',
          steel: '#B7B7CE',
          fairy: '#D685AD',
        }
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px #000',
        pixelYellow: '4px 4px 0px 0px #ffcc01',
        pixelBorder: '0 0 0 4px #121620, 0 0 0 8px #2e3440',
        pixelGlow: '0 0 15px rgba(255, 204, 1, 0.4)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      }
    },
  },
  plugins: [],
}
