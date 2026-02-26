import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html", // ← DIUBAH: tambah entry HTML Vite
    "./src/**/*.{js,ts,jsx,tsx}", // ← DIUBAH: src/ bukan app/+pages/+components/
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-raised": "var(--bg-raised)",
        "bg-card": "var(--bg-card)",
        text: "var(--text)",
        "text-dim": "var(--text-dim)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
      },
      fontFamily: {
        mono: ["Space Mono", "monospace"],
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        outer: "var(--radii-outer)", // 12px
        inner: "var(--radii-inner)", // 8px
        button: "100px", // pill shape untuk semua buttons
      },
      height: {
        taxbutton: "var(--taxbutton-height)", // 40px
      },
      boxShadow: {
        inset: "var(--inset-shadow)",
        emboss: "var(--emboss-shadow)",
        "emboss-hover": "var(--emboss-shadow-hover)",
        "emboss-less": "var(--emboss-shadow-less)",
        "emboss-less-hover": "var(--emboss-shadow-less-hover)",
      },
      transitionTimingFunction: {
        "back-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "circ-out": "cubic-bezier(0, 0.55, 0.45, 1)",
        "quart-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
        // ease-material: gunakan [transition-timing-function:var(--ease-material)]
      },
      keyframes: {
        // Spinning rings (sudah ada di config lama)
        "spin-ring": { to: { transform: "rotate(360deg)" } },
        "spin-reverse": { to: { transform: "rotate(-360deg)" } },

        // ← DITAMBAHKAN: semua yang hilang dari config lama
        bounce: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(6px)" },
        },
        "orb-pulse": {
          "0%, 100%": {
            transform: "translate(-50%,-50%) scale(1)",
            opacity: "0.6",
          },
          "50%": {
            transform: "translate(-50%,-50%) scale(1.08)",
            opacity: "1",
          },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "ticker-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        // Spinning rings
        "spin-slow": "spin-ring 22s linear infinite",
        "spin-medium": "spin-ring 16s linear infinite reverse", // ← fix: pakai spin-ring
        "spin-fast": "spin-reverse 11s linear infinite",

        // ← DITAMBAHKAN
        "bounce-scroll": "bounce 2.2s ease-in-out infinite",
        "orb-pulse": "orb-pulse 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s var(--ease-circ-out) forwards",
        ticker: "ticker-scroll 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
