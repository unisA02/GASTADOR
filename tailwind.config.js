/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./login/**/*.html",      // all HTML files in login
    "./register/**/*.html",   // all HTML files in register
    "./*.html",               // HTML files in root
    "./src/**/*.js"           // JS files in src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
