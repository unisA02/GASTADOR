/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./login/*.html",      // all login HTML files
    "./register/*.html",   // register HTML files
    "./*.html",            // any HTML at root
    "./src/**/*.css",      // your input.css
    "./**/*.js"            // all JS files
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',   // orange from your style
        secondary: '#f87171', // red from your style
      },
    },
  },
  plugins: [],
}
