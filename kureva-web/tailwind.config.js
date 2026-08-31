/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        primary: "#111111",
        secondary: "#6B6B6B",
        border: "#E8E8E8",
        soft: "#F7F7F5",
        accent: {
          DEFAULT: "#2F7D57",
          dark: "#245E43",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
