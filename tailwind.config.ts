import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        headline: ["Instrument Serif", "serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        accent: {
          DEFAULT: "hsl(var(--accent-hsl))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border-hsl))",
        muted: {
          DEFAULT: "hsl(var(--muted-hsl))",
          foreground: "hsl(var(--muted-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        input: "var(--radius-input)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
