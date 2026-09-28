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
// Book objects returned by the API may include `has_audio`, `audio_url`,
// or `audio_count`. We treat any truthy value as "has audio".
function bookHasAudio(book: any): boolean {
  return !!(book.has_audio || book.audio_url || (book.audio_count && book.audio_count > 0));
}

/* ── Shared container width ──────────────────────────────────────────────── */
// Both <header> inner div and <main> use this so the wordmark aligns
// with the page content's left edge.
const CONTENT_WIDTH = "max-w-5xl mx-auto px-4 sm:px-6";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) setUser(cached);
    api.getMe().then(u => { if (u) setUser(u); }).catch(() => {});
    api.getBooks()
      .then(data => { setBooks(Array.isArray(data) && data.length > 0 ? data : BOOKS); })
      .catch(() => setBooks(BOOKS))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { clearAuthToken(); setUser(null); setMenuOpen(false); };
  const heroBook     = books[0] || null;
  const catalogBooks = books.slice(1);

  return (
    <div className="min-h-screen bg-[#F6F1E7]">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#F6F1E7]/95 backdrop-blur-sm border-b border-[#E3DCCB]">
        <div className={`${CONTENT_WIDTH} py-3 flex items-center justify-between`}>

          {/* Wordmark — Newsreader serif */}
          <Link
            href="/"
            className="font-serif text-2xl font-semibold text-[#1B1A17] tracking-tight leading-none"
          >
            Bookify
          </Link>

          {/* Desktop nav — Inter 14 px */}
          <nav className="hidden md:flex items-center gap-6 text-[14px] text-[#5C584F]">
            <Link href="/"      className="hover:text-[#1B1A17] transition-colors">Kutubxona</Link>
            <Link href="/zen"   className="hover:text-[#1B1A17] transition-colors">Zen Mutolaa</Link>
            <Link href="/saved" className="hover:text-[#1B1A17] transition-colors">Saqlangan</Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-[14px] font-medium text-[#1B1A17] border border-[#E3DCCB] rounded-full px-3 py-1.5 hover:bg-[#FBF8F1] transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-[#B4472B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(user.name || user.email || "K").charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate hidden sm:block">{user.name || user.email}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-[#FBF8F1] border border-[#E3DCCB] rounded-lg shadow-md py-1 z-50">
                    <div className="px-3 py-2 border-b border-[#E3DCCB]">
                      <div className="text-[13px] text-[#5C584F]">{user.role || "Kitobxon"}</div>
                      <div className="text-[14px] font-semibold text-[#1B1A17] truncate">{user.name || user.email}</div>
                    </div>
                    {String(user.role || "").toLowerCase().includes("admin") && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-[14px] text-[#1B1A17] hover:bg-[#F6F1E7] transition-colors">Admin panel</Link>
                    )}
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-[14px] text-[#1B1A17] hover:bg-[#F6F1E7] transition-colors">Profil</Link>
                    <Link href="/saved"   onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-[14px] text-[#1B1A17] hover:bg-[#F6F1E7] transition-colors">Saqlangan</Link>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-[14px] text-[#B4472B] hover:bg-[#F6F1E7] transition-colors flex items-center gap-2">
                      <LogOut size={14} /> Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="text-[14px] font-medium border border-[#E3DCCB] rounded-md px-4 py-1.5 text-[#1B1A17] hover:bg-[#FBF8F1] transition-colors">
                Kirish
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className={`${CONTENT_WIDTH} py-10 pb-28 space-y-14`}>

        {/* Hero */}
        {heroBook && (
          <section className="border-b border-[#E3DCCB] pb-14">
            {/* Label */}
            <p className="text-[11px] font-semibold text-[#B4472B] uppercase tracking-widest mb-5">
              Hafta asari
            </p>

            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Cover — ~200 px wide */}
              <Link href={`/read/${heroBook.id}`} className="shrink-0 block">
                <div className="w-[200px] aspect-[2/3] rounded-lg border border-[#E3DCCB] overflow-hidden bg-[#FBF8F1]">
                  {resolveFileUrl(heroBook.cover_image) ? (
                    <img
                      src={resolveFileUrl(heroBook.cover_image)}
                      alt={heroBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Typographic fallback cover */
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#E3DCCB] gap-2">
                      <span className="font-serif text-base font-bold text-[#1B1A17] leading-snug">{heroBook.title}</span>
                      {heroBook.author && (
                        <span className="font-sans text-[13px] text-[#5C584F]">{heroBook.author}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>

              {/* Text */}
              <div className="flex-1">
                {/* Title ~48px */}
                <h1 className="font-serif text-[40px] sm:text-[48px] font-bold text-[#1B1A17] leading-[1.15] mb-3">
                  {heroBook.title}
                </h1>
                {heroBook.author && (
                  <p className="text-[#5C584F] text-[15px] mb-2">{heroBook.author}</p>
                )}
                {heroBook.description && (
                  <p className="text-[#5C584F] text-[15px] leading-[1.65] mb-7 line-clamp-3">
                    {heroBook.description}
                  </p>
                )}

                {/* CTAs — same height, outlined secondary */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href={`/read/${heroBook.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B4472B] text-white text-[14px] font-semibold rounded-md hover:bg-[#9e3d25] transition-colors"
                  >
                    <BookOpen size={15} />
                    Oʻqishni boshlash
                  </Link>
                  {/* Outlined — same height as primary */}
                  <Link
                    href={`/book/${heroBook.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E3DCCB] text-[#5C584F] text-[14px] font-semibold rounded-md hover:bg-[#FBF8F1] transition-colors"
                  >
                    <Headphones size={15} />
                    Audio tinglash
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Catalog ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-16 text-center text-[#5C584F] text-[15px]">Yuklanmoqda…</div>
        ) : catalogBooks.length > 0 ? (
          <section>
            <div className="flex items-baseline justify-between mb-6">
              {/* Section heading — Newsreader serif */}
              <h2 className="font-serif text-2xl font-semibold text-[#1B1A17]">Kutubxona</h2>
              {/* Show count only when there are 12+ books so it's meaningful */}
              {catalogBooks.length >= 12 && (
                <span className="text-[13px] text-[#5C584F]">{catalogBooks.length} ta asar</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
              {catalogBooks.map(book => {
                const hasAudio = bookHasAudio(book);
                return (
                  /* Whole card is one Link — no secondary "O'qish · Audio" row */
                  <Link
                    key={book.id}
                    href={`/read/${book.id}`}
                    className="group block"
                  >
                    {/* Cover */}
                    <div className="aspect-[2/3] rounded-lg border border-[#E3DCCB] overflow-hidden bg-[#FBF8F1] mb-2">
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

                    {/* Title — 16px Newsreader serif */}
                    <h3 className="font-serif text-[16px] font-semibold text-[#1B1A17] leading-snug line-clamp-2">
                      {book.title}
                    </h3>

                    {/* Author + optional audio badge — 13px muted */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[13px] text-[#5C584F] truncate">
                        {book.author || "Muallif noma\u02bclum"}
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

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBF8F1] border-t border-[#E3DCCB] flex">
        {[
          { href: "/",        label: "Kutubxona" },
          { href: "/zen",     label: "Zen" },
          { href: "/saved",   label: "Saqlangan" },
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