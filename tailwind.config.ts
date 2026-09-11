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
      colors: {
        // Human-Made Palette
        ink: "#0B0F1A",
        inkSoft: "#131828",
        parchment: "#FDFBF7",     // O'ta toza, oqqa yaqin iliq fon
        parchmentDim: "#F5EFE0",  // Sal to'qroq iliq fon
        gold: "#C9A24B",
        goldDim: "rgba(201,162,75,0.22)",
        ember: "#E05638",         // Urg'u uchun toza qizil-apelsin
        emberSoft: "rgba(224, 86, 56, 0.12)",
        
        // Legacy (Qolgan komponentlar sinib qolmasligi uchun vaqtincha turadi)
        terracotta: { 50: "#FDF4F2", 100: "#FCE7E4", 500: "#E05638", 600: "#C74326", 700: "#A3331C" },
        obsidian: { 50: "#F4F6F8", 900: "#0E1218", 950: "#080B0F", card: "#121620", border: "rgba(255,255,255,0.08)" },
      },
      fontFamily: {
        serif:    ["var(--font-fraunces)", "Georgia", "serif"],
        sans:     ["var(--font-sans)", "system-ui", "sans-serif"],
        literata: ["var(--font-literata)", "Georgia", "serif"],
        mono:     ["var(--font-mono)", "monospace"],
      },
      borderColor: {
        // Asosiy ajratuvchi chiziqlar qat'iy va nozik bo'ladi
        DEFAULT:  "rgba(0, 0, 0, 0.06)",
        dark:     "rgba(255, 255, 255, 0.08)",
        goldHair: "rgba(201,162,75,0.35)",
      },
      boxShadow: {
        // Qalin soyalar yo'q qilindi! O'rniga faqat qog'oz tekisligidagi nozik soyalar.
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        DEFAULT: "0 2px 4px -1px rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        "book": "0 2px 8px -2px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.2)",
        "book-deep": "0 8px 20px -4px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.2)",
        none: "none",
      },
    },
  },
  plugins: [],
} satisfies Config;