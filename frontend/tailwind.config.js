/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: "#00ff9f",
        night: "#07131f",
        panel: "#0d1b2a",
        "theme-card": "rgba(13, 27, 42, 0.7)",
        "theme-accent": "#00ff9f",
        "color": "rgba(255, 255, 255, 0.1)"
      },
      boxShadow: {
        glass: "0 30px 80px rgba(0, 0, 0, 0.35)",
        "theme-glow": "0 0 50px rgba(0, 255, 159, 0.15)"
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
