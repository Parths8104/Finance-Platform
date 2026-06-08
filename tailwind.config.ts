import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15201b",
        paper: "#f6f4ee",
        card: "#ffffff",
        line: "#e6e2d8",
        moss: {
          50: "#eef4ef",
          100: "#d6e6d9",
          400: "#4c9d6b",
          500: "#2f7d50",
          600: "#236340",
          700: "#1b4d33",
        },
        clay: "#c2613f",
        muted: "#74786f",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-hanken)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21,32,27,.04), 0 8px 24px rgba(21,32,27,.05)",
        lift: "0 2px 4px rgba(21,32,27,.06), 0 16px 40px rgba(21,32,27,.08)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
