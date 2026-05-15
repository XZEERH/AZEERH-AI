import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // INI WAJIB DITAMBAHKAN UNTUK MODE TERANG/GELAP
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;