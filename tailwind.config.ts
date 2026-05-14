import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Dark mode standard
        foreground: "#fafafa",
        azeerh: {
          cyan: "#00f3ff",
          magenta: "#ff00ff",
          dark: "#050510"
        }
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;