import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          soft: "var(--bg-soft)",
          card: "var(--bg-card)",
          border: "var(--bg-border)",
        },
        neon: {
          cyan: "#22d3ee",
          magenta: "#d946ef",
          green: "#34d399",
          red: "#f43f5e",
          gold: "#fbbf24",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(34, 211, 238, 0.35)",
        "neon-magenta": "0 0 20px rgba(217, 70, 239, 0.35)",
      },
      backgroundImage: {
        "neon-gradient":
          "linear-gradient(90deg, #22d3ee 0%, #d946ef 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
