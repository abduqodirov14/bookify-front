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
        parchment: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F5EFE0',
          300: '#EDE4CE',
          400: '#DECFA8',
          500: '#C5A059',
          600: '#A6823F',
          700: '#7F602B',
          800: '#5C441E',
          900: '#3D2C12',
        },
        terracotta: {
          50: '#FDF4F2',
          100: '#FCE7E4',
          500: '#E05638',
          600: '#C74326',
          700: '#A3331C',
        },
        obsidian: {
          50: '#F4F6F8',
          900: '#0E1218',
          950: '#080B0F',
          card: '#121620',
          border: 'rgba(255, 255, 255, 0.08)'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Literata', 'Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'book': '0 12px 30px -10px rgba(0, 0, 0, 0.25), 0 4px 10px rgba(0, 0, 0, 0.1)',
        'book-deep': '0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(197, 160, 89, 0.15)',
        'page': 'inset 0 0 40px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.08)',
        'page-dark': 'inset 0 0 40px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.5)',
      }
    },
  },
  plugins: [],
} satisfies Config;
