"use client";

/**
 * Uzbek apostrophe reference (prevents regressions):
 *   oʻ / gʻ  — modifier letter turned comma  U+02BB  ʻ
 *   tutuq     — modifier letter apostrophe    U+02BC  ʼ
 * Never use straight apostrophe (') in Uzbek UI copy.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Headphones, LogOut } from "lucide-react";
import { api, getCachedUser, clearAuthToken, resolveFileUrl } from "@/services/api";
import { BOOKS } from "@/data/books";

/* ── Audio detection ─────────────────────────────────────────────────────── */
function bookHasAudio(book: any): boolean {
  return !!(book.has_audio || book.audio_url || (book.audio_count && book.audio_count > 0));
}

/* ── Hero book meta string (page count · audio duration) ─────────────────── */
function getHeroMeta(book: any): string | null {
  if (!book) return null;
  const parts: string[] = [];
  const pages = book.pages_count || book.pages;
  if (pages && Number(pages) > 0) {
    parts.push(`${pages} sahifa`);
  }
  const audio = book.audio_duration || book.audioDuration;
  if (audio) {
    if (typeof audio === "number") {
      const h = Math.floor(audio / 3600);
      const m = Math.floor((audio % 3600) / 60);
      if (h > 0) {
        parts.push(`${h} soat ${m > 0 ? `${m} daqiqa` : ""}`.trim() + " audio");
      } else if (m > 0) {
        parts.push(`${m} daqiqa audio`);
      }
    } else if (typeof audio === "string" && audio.trim()) {
      parts.push(`${audio.trim()} audio`);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

/* ── Luminance-based contrast checker (WCAG AA/AAA) ──────────────────────── */
function getContrastTextColor(hex?: string): string {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return "#F6F1E7";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L < 0.45 ? "#F6F1E7" : "#1B1A17";
}

/* ── Shared container width ──────────────────────────────────────────────── */
const CONTENT_WIDTH = "max-w-5xl mx-auto px-4 sm:px-6";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.title = "Bookify — oʻzbek tilidagi kitoblar: oʻqing va tinglang";
    const cached = getCachedUser();
    if (cached) setUser(cached);
    api.getMe().then(u => { if (u) setUser(u); }).catch(() => {});
    api.getBooks()
      .then(data => { setBooks(Array.isArray(data) && data.length > 0 ? data : BOOKS); })
      .catch(() => setBooks(BOOKS))
      .finally(() => setLoading(false));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 380);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => { clearAuthToken(); setUser(null); setMenuOpen(false); };
  const heroBook     = books[0] || null;
  const catalogBooks = books.slice(1);
  const heroAccent   = heroBook?.accent_color || heroBook?.accentColor || "#7A4109";
  const heroMeta     = getHeroMeta(heroBook);

  return (
    <div className="min-h-screen bg-[#F6F1E7]">

      {/* ── Header: transparent over hero, cream + ink on scroll ────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#F6F1E7]/95 backdrop-blur-sm border-b border-[#E3DCCB]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className={`${CONTENT_WIDTH} py-3.5 flex items-center justify-between`}>

          {/* Wordmark — Newsreader serif */}
          <Link
            href="/"
            className={`font-serif text-2xl font-semibold tracking-tight leading-none transition-colors duration-200 ${
              isScrolled ? "text-[#1B1A17]" : "text-[#F6F1E7]"
            }`}
          >
            Bookify
          </Link>

          {/* Desktop nav — Inter 14 px */}
          <nav
            className={`hidden md:flex items-center gap-6 text-[14px] transition-colors duration-200 ${
              isScrolled ? "text-[#5C584F]" : "text-[#F6F1E7]/80"
            }`}
          >
            <Link href="/" className={`transition-colors ${isScrolled ? "hover:text-[#1B1A17]" : "hover:text-[#F6F1E7]"}`}>Kutubxona</Link>
            <Link href="/zen" className={`transition-colors ${isScrolled ? "hover:text-[#1B1A17]" : "hover:text-[#F6F1E7]"}`}>Zen Mutolaa</Link>
            <Link href="/saved" className={`transition-colors ${isScrolled ? "hover:text-[#1B1A17]" : "hover:text-[#F6F1E7]"}`}>Saqlangan</Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-opacity hover:opacity-90 flex-shrink-0 ${
                    isScrolled
                      ? "bg-[#B4472B] text-white"
                      : "bg-[#F6F1E7] text-[#1B1A17] shadow-sm"
                  }`}
                  title={user.name || user.email || "Profil"}
                  aria-label="Foydalanuvchi menyusi"
                >
                  {(user.name || user.email || "K").charAt(0).toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 w-44 bg-[#FBF8F1] border border-[#E3DCCB] rounded-lg shadow-sm py-1 z-50">
                    <div className="px-3 py-2 border-b border-[#E3DCCB]">
                      <div className="text-[12px] text-[#5C584F]">{user.role || "Kitobxon"}</div>
                      <div className="text-[13px] font-semibold text-[#1B1A17] truncate">{user.name || user.email}</div>
                    </div>
                    {String(user.role || "").toLowerCase().includes("admin") && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-[14px] text-[#1B1A17] hover:bg-[#F6F1E7] transition-colors">Admin panel</Link>
                    )}
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-[14px] text-[#1B1A17] hover:bg-[#F6F1E7] transition-colors">Profil</Link>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-[14px] text-[#B4472B] hover:bg-[#F6F1E7] transition-colors flex items-center gap-2">
                      <LogOut size={14} /> Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className={`text-[14px] font-medium border rounded-md px-4 py-1.5 transition-colors ${
                  isScrolled
                    ? "border-[#E3DCCB] text-[#1B1A17] hover:bg-[#FBF8F1]"
                    : "border-[#F6F1E7]/40 text-[#F6F1E7] hover:bg-[#F6F1E7]/10"
                }`}
              >
                Kirish
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero: full-bleed band (~480px) with flat accent_color ─────────── */}
      {heroBook && (
        <section
          className="w-full relative transition-colors duration-300 overflow-visible pt-24 pb-16 lg:pt-0 lg:pb-0 lg:min-h-[480px] lg:h-[480px] flex items-center"
          style={{ backgroundColor: heroAccent }}
        >
          <div className={`${CONTENT_WIDTH} w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 relative`}>

            {/* Left: Metadata, Title, Description, Actions */}
            <div className="flex-1 max-w-xl z-10 text-left">
              <p className="text-[11px] font-semibold text-[#F6F1E7]/70 uppercase tracking-widest mb-3">
                HAFTA ASARI
              </p>

              <h1 className="font-serif text-[42px] sm:text-[54px] lg:text-[66px] font-bold text-[#F6F1E7] leading-[1.08] mb-3 tracking-tight">
                {heroBook.title}
              </h1>

              {heroBook.author && (
                <p className="text-[16px] text-[#F6F1E7]/85 font-medium mb-3">
                  {heroBook.author}
                </p>
              )}

              {heroBook.description && (
                <p className="text-[15px] leading-[1.65] text-[#F6F1E7]/80 line-clamp-2 mb-4 max-w-lg">
                  {heroBook.description}
                </p>
              )}

              {/* Real book data meta line */}
              {heroMeta && (
                <p className="text-[13px] text-[#F6F1E7]/70 font-medium mb-6">
                  {heroMeta}
                </p>
              )}

              {/* CTAs */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Primary: cream fill, dark text */}
                <Link
                  href={`/read/${heroBook.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F6F1E7] text-[#1B1A17] text-[14px] font-semibold rounded-md hover:bg-white transition-colors"
                >
                  <BookOpen size={16} />
                  Oʻqishni boshlash
                </Link>

                {/* Secondary: cream outline */}
                <Link
                  href={`/book/${heroBook.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#F6F1E7]/50 text-[#F6F1E7] text-[14px] font-semibold rounded-md hover:bg-[#F6F1E7]/10 transition-colors"
                >
                  <Headphones size={16} />
                  Audio tinglash
                </Link>
              </div>
            </div>

            {/* Right: Cover (~300px wide, rotated -3deg, overlapping bottom edge by ~80px) */}
            <div className="shrink-0 relative lg:translate-y-[80px] z-20">
              <Link href={`/read/${heroBook.id}`} className="block">
                <div
                  className="w-[240px] sm:w-[280px] lg:w-[300px] aspect-[2/3] rounded-lg overflow-hidden -rotate-3 transition-transform duration-200"
                  style={{
                    boxShadow: "0 30px 60px -20px rgba(0, 0, 0, 0.45)",
                  }}
                >
                  {resolveFileUrl(heroBook.cover_image) ? (
                    <img
                      src={resolveFileUrl(heroBook.cover_image)}
                      alt={heroBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#E3DCCB] gap-2">
                      <span className="font-serif text-base font-bold text-[#1B1A17] leading-snug">{heroBook.title}</span>
                      {heroBook.author && (
                        <span className="font-sans text-[13px] text-[#5C584F]">{heroBook.author}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* ── Library: below band on cream #F6F1E7, gap 32px, hover translateY(-6px) ── */}
      <main className={`${CONTENT_WIDTH} pt-28 lg:pt-36 pb-28`}>
        {loading ? (
          <div className="py-16 text-center text-[#5C584F] text-[15px]">Yuklanmoqda…</div>
        ) : catalogBooks.length > 0 ? (
          <section>
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-serif text-2xl font-semibold text-[#1B1A17]">Kutubxona</h2>
              {catalogBooks.length >= 12 && (
                <span className="text-[13px] text-[#5C584F]">{catalogBooks.length} ta asar</span>
              )}
            </div>

            {/* Gap 32px (gap-8) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
              {catalogBooks.map(book => {
                const hasAudio = bookHasAudio(book);
                return (
                  <Link
                    key={book.id}
                    href={`/read/${book.id}`}
                    className="group block"
                  >
                    {/* Cover: hover translateY(-6px) + soft shadow, 200ms ease-out */}
                    <div className="aspect-[2/3] rounded-lg border border-[#E3DCCB] overflow-hidden bg-[#FBF8F1] mb-3 transition-all duration-200 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.18)]">
                      {resolveFileUrl(book.cover_image) ? (
                        <img
                          src={resolveFileUrl(book.cover_image)}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#E3DCCB] gap-1.5">
                          <span className="font-serif text-sm font-bold text-[#1B1A17] leading-snug">{book.title}</span>
                          {book.author && (
                            <span className="font-sans text-[11px] text-[#5C584F]">{book.author}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Title — Newsreader 16px */}
                    <h3 className="font-serif text-[16px] font-semibold text-[#1B1A17] leading-snug line-clamp-2">
                      {book.title}
                    </h3>

                    {/* Author — 13px muted */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-[13px] text-[#5C584F] truncate">
                        {book.author || "Muallif nomaʼlum"}
                      </p>
                      {hasAudio && (
                        <Headphones
                          size={12}
                          className="text-[#5C584F] flex-shrink-0"
                          aria-label="Audio mavjud"
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          !loading && books.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-serif text-xl text-[#5C584F] mb-4">Kutubxona toʻldirilmoqda.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[14px] text-[#B4472B] hover:underline"
              >
                Qayta yuklash
              </button>
            </div>
          )
        )}
      </main>

      {/* ── Minimal footer ────────────────────────────────────────────────── */}
      <footer className={`${CONTENT_WIDTH} py-8 border-t border-[#E3DCCB] hidden md:block`}>
        <div className="flex items-center justify-between">
          <span className="font-serif text-[15px] text-[#5C584F]">Bookify</span>
          <p className="text-[13px] text-[#5C584F]">
            © {new Date().getFullYear()} — Oʻzbek adabiyoti kutubxonasi
          </p>
        </div>
      </footer>

      {/* ── Mobile bottom nav (md:hidden) ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBF8F1] border-t border-[#E3DCCB] flex">
        {[
          { href: "/", label: "Kutubxona" },
          { href: "/zen", label: "Zen" },
          { href: "/saved", label: "Saqlangan" },
          { href: "/profile", label: "Profil" },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5"
          >
            <span className="text-[10px] font-medium text-[#5C584F]">{item.label}</span>
          </Link>
        ))}
      </nav>

    </div>
  );
}