export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
      },
    },
    extend: {
      colors: {
        govBlue: "#1E5AA8",
        govOrange: "#F59E0B",
        govBg: "#F0F4F8",
        govGreen: "#10B981",
        govRed: "#EF4444",
        govPurple: "#8B5CF6",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },
    },
  },
  plugins: [],
};
