/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#1e293b", // Dark navy
        "accent": "#0ea5e9", // Blue accent
        "off-white": "#F9FAFB",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
    },
  },
  plugins: [],
}
