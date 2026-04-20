/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // تفعيل dark mode باستخدام class
  theme: {
    extend: {
      fontFamily: {
        aldahabi: ['Aldahabi', 'sans-serif'],
      },
  },
  plugins: [],
}}