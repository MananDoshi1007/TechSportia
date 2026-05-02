/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./routes/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        brand: {
          primary: "#7C3AED",
          accent:  "#06B6D4",
        },
        dark: {
          100: "#1E1E35",
          200: "#1C1C2E",
          300: "#151521",
          400: "#111120",
          500: "#0D0D1A",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease both",
        "fade-in":    "fadeIn 0.4s ease both",
        "float":      "float 5s ease-in-out infinite",
        "blob":       "blob 8s ease-in-out infinite",
        "spin-slow":  "spin 20s linear infinite",
      },
      keyframes: {
        fadeInUp:  { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        float:     { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        blob:      { "0%,100%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" }, "50%": { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%" } },
      },
      boxShadow: {
        glow:   "0 0 40px rgba(124,58,237,0.3)",
        "glow-lg": "0 0 60px rgba(124,58,237,0.5)",
        card:   "0 4px 24px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};