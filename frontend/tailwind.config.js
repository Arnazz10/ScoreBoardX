/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"]
      },
      colors: {
        sage: "#e8ebe6",
        panel: "#f6f8f4",
        lime: "#d4f74a",
        ink: "#111111"
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
};
