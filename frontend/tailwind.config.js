/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F5EF',
        beige: '#E9E5D9',
        natural: {
          DEFAULT: '#588157',
          hover: '#4b714a',
          light: '#eef3ec'
        },
        forest: {
          DEFAULT: '#344E41',
          dark: '#273c32',
          light: '#3d5c4d'
        },
        sage: {
          DEFAULT: '#A3B18A',
          hover: '#8f9e77',
          light: '#f2f5ed'
        },
        charcoal: {
          DEFAULT: '#292B25',
          light: '#3d4037'
        },
        muted: {
          DEFAULT: '#77786F',
          light: '#a1a299'
        },
        borderLight: '#E5E2D8',
        success: '#588157',
        warning: '#D69E36',
        danger: '#C66B62',
        info: '#6487A5'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(41, 43, 37, 0.04), 0 1px 2px -1px rgba(41, 43, 37, 0.04)',
        'premium': '0 4px 20px -2px rgba(41, 43, 37, 0.05), 0 2px 6px -1px rgba(41, 43, 37, 0.03)',
        'modal': '0 20px 25px -5px rgba(52, 78, 65, 0.1), 0 8px 10px -6px rgba(52, 78, 65, 0.08)',
      }
    },
  },
  plugins: [],
}
