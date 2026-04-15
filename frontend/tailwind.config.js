/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: "#00ff9f",
        night: "#07131f",
        panel: "#0d1b2a"
      },
      boxShadow: {
        glass: "0 30px 80px rgba(0, 0, 0, 0.35)"
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
