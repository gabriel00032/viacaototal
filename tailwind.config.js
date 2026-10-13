/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        total: { blue: "#0a2a5e", dark: "#071d42", orange: "#f26522", light: "#f5f7fb" }
      }
    }
  },
  plugins: []
};
