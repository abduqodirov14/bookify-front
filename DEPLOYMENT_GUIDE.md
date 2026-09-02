# 🚀 Fianny Book v2 — Vercel & Render To'liq Deploy Qo'llanmasi

Ushbu loyiha **`d:\my start Upianny-v2`** papkasida 2 ta mustaqil va toza qismga ajratilgan:
1. **`frontend/`** — Next.js 15 (Vercel uchun to'liq tayyor)
2. **`backend/`** — FastAPI + PostgreSQL (Render / Docker uchun to'liq tayyor)

---

## 🌐 1. Backendni Render'ga Deploy Qilish (Free / Bepul)

1. **GitHub'da yangi Private Repository oching:**
   * Nomi: `fianny-backend`
   * `d:\my start Upianny-v2ackend` papkasidagi fayllarni GitHub'ga yuklang:
     ```bash
     cd "d:\my start Upianny-v2ackend"
     git init
     git add .
     git commit -m "feat: initial clean fastapi backend for render"
     git branch -M main
     git remote add origin https://github.com/<GITHUB_USERNAME>/fianny-backend.git
     git push -u origin main
     ```

2. **Render.com'ga kiring va yangi Web Service oching:**
   * [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Web Service** (yoki **Blueprint** orqali `render.yaml` ni tanlang).
   * **Runtime:** Python 3
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Environment Variables (Environment):**
     * `DATABASE_URL` = *(Render'dagi bepul PostgreSQL ulanish linki)*
     * `SECRET_KEY` = `fianny_jwt_secret_key_2026_super_secure`
     * `ADMIN_EMAIL` = `abduqodirovdilshodbek317@gmail.com`
     * `CORS_ORIGINS` = `https://fianny-frontend.vercel.app,http://localhost:3002`

3. **Render bergan API URL'ni oling:**
   * Masalan: `https://fianny-backend.onrender.com`

---

## ⚡ 2. Frontendni Vercel'ga Deploy Qilish

1. **GitHub'da yangi Private Repository oching:**
   * Nomi: `fianny-frontend`
   * `d:\my start Upianny-v2rontend` papkasidagi fayllarni GitHub'ga yuklang:
     ```bash
     cd "d:\my start Upianny-v2rontend"
     git init
     git add .
     git commit -m "feat: initial clean nextjs 15 frontend for vercel"
     git branch -M main
     git remote add origin https://github.com/<GITHUB_USERNAME>/fianny-frontend.git
     git push -u origin main
     ```

2. **Vercel.com'ga kiring va loyihani import qiling:**
   * [Vercel Dashboard](https://vercel.com/) -> **Add New...** -> **Project**.
   * `fianny-frontend` omborini tanlang (**Framework:** Next.js avtomatik aniqlanadi).
   * **Environment Variables (Muhit O'zgaruvchilari):**
     * `NEXT_PUBLIC_API_URL` = `https://fianny-backend.onrender.com/api/v1`
   * **Deploy** tugmasini bosing!

---

## 🔒 Xavfsizlik & Arxitektura Qoidalari

* ❌ **Hech qanday statik / soxta demo kitoblar yo'q:** Baza toza va real kitoblar faqat administrator tomonidan yuklanadi.
* ❌ **Hech qanday parollar yoki admin ma'lumotlari kodda saqlanmagan:** Login va parol maydonlari toza, xavfsiz JWT va 2FA OTP tizimi ishlaydi.
* 🛡️ **Oddiy foydalanuvchilar himoyasi:** Oddiy kitobxonlar admin panelga kira olmaydi; backendda barcha admin so'rovlari `UserRole.ADMIN` orqali qat'iy himoyalangan.
