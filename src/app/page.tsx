"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Headphones, LogOut } from "lucide-react";
import { api, getCachedUser, clearAuthToken, resolveFileUrl } from "@/services/api";
import { BOOKS } from "@/data/books";

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
  const heroBook = books[0] || null;
  const catalogBooks = books.slice(1);

  return (
    <div className="min-h-screen bg-[#F6F1E7] font-[var(--font-inter)]">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F6F1E7]/95 backdrop-blur-sm border-b border-[#E3DCCB] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-[var(--font-newsreader)] text-2xl font-semibold text-[#1B1A17] tracking-tight">
            Bookify
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#6B675E]">
            <Link href="/" className="hover:text-[#1B1A17] transition-colors">Kutubxona</Link>
            <Link href="/zen" className="hover:text-[#1B1A17] transition-colors">Zen Mutolaa</Link>
            <Link href="/saved" className="hover:text-[#1B1A17] transition-colors">Saqlangan</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-[#1B1A17] border border-[#E3DCCB] rounded-full px-3 py-1.5 hover:bg-[#FBF8F1] transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-[#B4472B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(user.name || user.email || 'K').charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate hidden sm:block">{user.name || user.email}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-[#FBF8F1] border border-[#E3DCCB] rounded-lg shadow-md py-1 z-50">
                    <div className="px-3 py-2 border-b border-[#E3DCCB]">
                      <div className="text-xs text-[#6B675E]">{user.role || 'Kitobxon'}</div>
                      <div className="text-sm font-semibold text-[#1B1A17] truncate">{user.name || user.email}</div>
                    </div>
                    {String(user.role || '').toLowerCase().includes('admin') && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#1B1A17] hover:bg-[#F6F1E7] transition-colors">Admin panel</Link>
                    )}
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#1B1A17] hover:bg-[#F6F1E7] transition-colors">Profil</Link>
                    <Link href="/saved" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#1B1A17] hover:bg-[#F6F1E7] transition-colors">Saqlangan</Link>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-[#B4472B] hover:bg-[#F6F1E7] transition-colors flex items-center gap-2">
                      <LogOut size={14} /> Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="text-sm font-medium border border-[#E3DCCB] rounded-md px-4 py-1.5 text-[#1B1A17] hover:bg-[#FBF8F1] transition-colors">
                Kirish
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 pb-28 space-y-14">

        {/* Hero */}
        {heroBook && (
          <section className="border-b border-[#E3DCCB] pb-14">
            <p className="text-xs font-semibold text-[#B4472B] uppercase tracking-widest mb-4">Hafta asari</p>
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <Link href={`/read/${heroBook.id}`} className="shrink-0 block">
                <div className="w-32 aspect-[2/3] rounded-lg border border-[#E3DCCB] overflow-hidden bg-[#FBF8F1]">
                  {resolveFileUrl(heroBook.cover_image) ? (
                    <img src={resolveFileUrl(heroBook.cover_image)} alt={heroBook.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-3 text-center">
                      <span className="font-[var(--font-newsreader)] text-sm font-bold text-[#1B1A17] leading-tight">{heroBook.title}</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1">
                <h1 className="font-[var(--font-newsreader)] text-4xl sm:text-5xl font-bold text-[#1B1A17] leading-tight mb-3">
                  {heroBook.title}
                </h1>
                <p className="text-[#6B675E] text-base leading-relaxed mb-2">
                  {heroBook.author || ''}
                </p>
                {heroBook.description && (
                  <p className="text-[#6B675E] text-base leading-relaxed mb-6 line-clamp-3">
                    {heroBook.description}
                  </p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    href={`/read/${heroBook.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B4472B] text-white text-sm font-semibold rounded-md hover:bg-[#9e3d25] transition-colors"
                  >
                    <BookOpen size={16} />
                    O&apos;qishni boshlash
                  </Link>
                  <Link
                    href={`/book/${heroBook.id}`}
                    className="inline-flex items-center gap-2 text-sm text-[#6B675E] hover:text-[#1B1A17] transition-colors"
                  >
                    <Headphones size={14} />
                    Audio tinglash
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Catalog */}
        {loading ? (
          <div className="py-16 text-center text-[#6B675E] text-sm">Yuklanmoqda...</div>
        ) : catalogBooks.length > 0 ? (
          <section>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-[var(--font-newsreader)] text-2xl font-semibold text-[#1B1A17]">Kutubxona</h2>
              <span className="text-sm text-[#6B675E]">{catalogBooks.length} ta asar</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
              {catalogBooks.map(book => (
                <div key={book.id}>
                  <Link href={`/read/${book.id}`} className="block">
                    <div className="aspect-[2/3] rounded-lg border border-[#E3DCCB] overflow-hidden bg-[#FBF8F1] mb-2">
                      {resolveFileUrl(book.cover_image) ? (
                        <img src={resolveFileUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center bg-[#E3DCCB]">
                          <span className="font-[var(--font-newsreader)] text-sm font-bold text-[#1B1A17] leading-tight">{book.title}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <h3 className="font-[var(--font-newsreader)] text-sm font-semibold text-[#1B1A17] leading-tight truncate">{book.title}</h3>
                  <p className="text-xs text-[#6B675E] truncate mt-0.5">{book.author || "Muallif noma'lum"}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Link href={`/read/${book.id}`} className="text-xs font-medium text-[#B4472B] hover:underline">O&apos;qish</Link>
                    <span className="text-[#E3DCCB]">·</span>
                    <Link href={`/book/${book.id}`} className="text-xs text-[#6B675E] hover:text-[#1B1A17] transition-colors">Audio</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          !loading && books.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-[var(--font-newsreader)] text-xl text-[#6B675E] mb-4">Kutubxona to&apos;ldirilmoqda.</p>
              <button onClick={() => window.location.reload()} className="text-sm text-[#B4472B] hover:underline">Qayta yuklash</button>
            </div>
          )
        )}

      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBF8F1] border-t border-[#E3DCCB] flex">
        {[
          { href: '/', icon: BookOpen, label: 'Kutubxona' },
          { href: '/zen', label: 'Zen' },
          { href: '/saved', label: 'Saqlangan' },
          { href: '/profile', label: 'Profil' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5">
            <span className="text-[10px] font-medium text-[#6B675E]">{item.label}</span>
          </Link>
        ))}
      </nav>

    </div>
  );
}