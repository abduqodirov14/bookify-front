# 📖 Bookify (Frontend) — Milliy Kitob & Audio Sanatoriysi

**Bookify** — bu zamonaviy o'zbek adabiyoti, mumtoz durdonalar va audio spektakllar uchun yaratilgan yuqori darajadagi (high-end) zamonaviy veb-platforma.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://react.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Asosiy Imkoniyatlar

- **📖 3D Varaqlanuvchi Kitobxon Dvigateli (Reader Engine):** 2-tomonlama yoyilma, markaziy jild crease soyasi, oq / sepiya / pergament / tungi obsidiyan mavzulari va shrift sozlamalari.
- **🎧 Audio Spektakl Dock:** Pastki qismda joylashgan doimiy audio pleyer, animatsiyali SVG ovoz to'lqini va 15 soniya oldinga/orqaga o'tkazish.
- **📚 "Mening Javonim" (Personal Shelf):** Sevimli asarlarni bir klikda javonga saqlash va real o'qilgan foizni davom ettirish.
- **🏆 Adabiy Chempionat & Shon-sharaf Zali:** Top 3 g'oliblar podiumi, Jonli Reyting, Raqamli Muhrlangan Oltin Diplom va konfetti tantanasi.
- **🏛️ Buyuk Allomalar Sahifasi:** Abdulla Qodiriy, Cho'lpon, Pirimqul Qodirov va boshqa buyuk adiblar merosi.
- **🛡️ 2FA Bilan Himoyalangan Admin Panel:** Yangi kitoblarni yuklash (EPUB, DOCX, PDF, TXT) va yangi chempionat mavsumlarini ochish.

---

## 🚀 Texnologiyalar

- **Framework:** Next.js 15 (App Router)
- **UI & Stillar:** Tailwind CSS 3.4, Lucide React
- **Til:** TypeScript 5.7
- **Animatsiyalar:** Canvas Confetti, CSS 3D Transforms

---

## 🛠️ O'rnatish & Ishga Tushirish

### 1. Repositoryni klonlash:
```bash
git clone https://github.com/abduqodirov14/bookify-front.git
cd bookify-front
```

### 2. Bog'liqliklarni o'rnatish:
```bash
npm install
```

### 3. Muhit o'zgaruvchilarini sozlash:
`.env.local` faylini yarating va backend API manzilini kiriting:
```env
NEXT_PUBLIC_API_URL=https://bookify-backend.onrender.com/api/v1
```

### 4. Dasturni ishga tushirish:
```bash
# Dasturlash rejimi:
npm run dev

# Ishlab chiqarish (Production) qurish va ishga tushirish:
npm run build
npm run start
```

---

## 🌐 Vercel orqali 1-Klikda Deploy Qilish

1. [Vercel](https://vercel.com) ga kiring va **"Add New Project"** tugmasini bosing.
2. `abduqodirov14/bookify-front` repositorysini tanlang.
3. **Environment Variables** bo'limida:
   - `NEXT_PUBLIC_API_URL` = `https://bookify-backend.onrender.com/api/v1` (Render'dagi backend manzilingiz)
4. **"Deploy"** tugmasini bosing — 1 daqiqa ichida sayt global CDN tarmog'ida jonli ishga tushadi!

---

## 📄 Litsenziya

Ushbu loyiha [MIT Litsenziyasi](LICENSE) asosida ochiq manbalidir.
