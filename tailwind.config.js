/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        total: { blue: "#0a2a5e", dark: "#071d42", orange: "#f26522", light: "#f5f7fb" },
        navy: "#0c1e46",
        primary: { DEFAULT: "#1e5dd8", dark: "#1749ab" },
        accent: { DEFAULT: "#f2930d", dark: "#d97f06" },
        whatsapp: { DEFAULT: "#22b358", dark: "#1a9047" },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Sora", "Manrope", "sans-serif"],
      },
      boxShadow: { card: "0 20px 50px -20px rgba(12,30,70,.35)" },
    }
  },
  plugins: []
};
