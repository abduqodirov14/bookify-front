import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand color tokens (app_ui_prompt.md §2) ──────────────────────────
      colors: {
        // Ink — dark backgrounds
        ink: "#0B0F1A",
        inkSoft: "#131828",
        // Parchment — light/warm surfaces
        parchment: "#EDE6D3",
        parchmentDim: "#A9A38C",
        // Gold — borders, accents, metadata
        gold: "#C9A24B",
        goldDim: "rgba(201,162,75,0.25)",
        // Ember — ONE primary action per screen only
        ember: "#B5442E",
        emberSoft: "rgba(181,68,46,0.12)",
        // Legacy aliases (used in some existing components)
        terracotta: {
          50:  "#FDF4F2",
          100: "#FCE7E4",
          500: "#E05638",
          600: "#C74326",
          700: "#A3331C",
        },
        obsidian: {
          50:   "#F4F6F8",
          900:  "#0E1218",
          950:  "#080B0F",
          card:   "#121620",
          border: "rgba(255,255,255,0.08)",
        },
      },

      // ── Typography (app_ui_prompt.md §4.5) ───────────────────────────────
      fontFamily: {
        // Display headings — Fraunces (CSS var set in layout.tsx)
        serif:    ["var(--font-fraunces)", "Georgia", "serif"],
        // UI text, labels, body prose
        sans:     ["var(--font-sans)", "system-ui", "sans-serif"],
        // Reader body text only
        literata: ["var(--font-literata)", "Georgia", "serif"],
        // Prices, metadata, monospace labels
        mono:     ["var(--font-mono)", "monospace"],
      },

      // ── Border — hairline gold instead of drop shadows ───────────────────
      borderColor: {
        DEFAULT:    "rgba(201,162,75,0.18)",  // goldDim border
        goldHair:   "rgba(201,162,75,0.35)",
      },

      // ── Minimal shadows (only for layering, not decoration) ───────────────
      boxShadow: {
        "book":      "0 12px 30px -10px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.1)",
        "book-deep": "0 20px 40px -15px rgba(0,0,0,0.4), 0 0 20px rgba(201,162,75,0.12)",
        "page":      "inset 0 0 40px rgba(0,0,0,0.05)",
        "page-dark": "inset 0 0 40px rgba(0,0,0,0.4)",
        "none":      "none",
      },
    },
  },
  plugins: [],
} satisfies Config;