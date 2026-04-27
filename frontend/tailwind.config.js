/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070b1a",
          900: "#0b1124",
          850: "#0f172a",
          800: "#131c34",
          700: "#1c2547",
          600: "#283363",
        },
        accent: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(59,130,246,0.45)",
      },
    },
  },
  plugins: [],
};
