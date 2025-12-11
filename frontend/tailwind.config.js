/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f9f5ff',
          100: '#f2e9ff',
          200: '#e6d1ff',
          300: '#d4b3ff',
          400: '#B67FDD', // 2
          500: '#8236B9', // 3
          600: '#661F99', // 1
          700: '#4D0482', // 4
          800: '#3e0368',
          900: '#2d0252'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}
