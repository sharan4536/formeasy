/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#38BDF8",
        muted: "#6B7280",
        success: "#16A34A",
        warning: "#F59E0B"
      }
    },
  },
  plugins: [],
}
