/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563eb", light: "#3b82f6", dark: "#1d4ed8" },
        secondary: { DEFAULT: "#64748b", light: "#94a3b8", dark: "#475569" },
        accent: { DEFAULT: "#10b981", light: "#34d399", dark: "#059669" },
        danger: { DEFAULT: "#ef4444", light: "#f87171", dark: "#dc2626" },
        warning: { DEFAULT: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
      },
      borderRadius: { DEFAULT: "12px" },
      fontFamily: { sans: ["Inter", "sans-serif"] },
    },
  },
  plugins: [],
};