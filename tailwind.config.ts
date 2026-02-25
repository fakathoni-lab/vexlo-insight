import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
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
        outer: "var(--radii-outer)",
        inner: "var(--radii-inner)",
      },
      height: {
        taxbutton: "var(--taxbutton-height)",
      },
      boxShadow: {
        emboss: "var(--emboss-shadow)",
        "emboss-hover": "var(--emboss-shadow-hover)",
        "emboss-less": "var(--emboss-shadow-less)",
        inset: "var(--inset-shadow)",
      },
      transitionTimingFunction: {
        "back-out": "var(--ease-back-out)",
        "circ-out": "var(--ease-circ-out)",
        "quart-in-out": "var(--ease-quart-in-out)",
      },
      keyframes: {
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "orb-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.15)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "spin-ring": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "bounce-scroll": "bounce 2s ease-in-out infinite",
        "orb-pulse": "orb-pulse 4s ease-in-out infinite",
        "fade-up": "fade-up 0.6s var(--ease-circ-out) both",
        ticker: "ticker-scroll 30s linear infinite",
        "spin-ring": "spin-ring 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
