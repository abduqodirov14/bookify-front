"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, resolveFileUrl } from "@/services/api";

export default function SavedPage() {
  const router = useRouter();
  const [savedBooks, setSavedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Saqlanganlar — Bookify';
    api.getLibrary()
      .then(items => {
        if (Array.isArray(items) && items.length > 0) {
          const list = items.map((item: any) => item.book || item);
          setSavedBooks(list);
        } else {
          api.getBooks().then(books => {
            if (Array.isArray(books)) {
              setSavedBooks(books.slice(0, 4));
            }
          }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (book: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
    try {
      await api.removeFromLibrary(book.id);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] font-[var(--font-inter)] text-[#1B1A17] pb-24">
      
      <header className="sticky top-0 z-40 bg-[#F6F1E7]/95 backdrop-blur-sm border-b border-[#E3DCCB] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-[var(--font-newsreader)] text-xl font-semibold text-[#1B1A17]">
          Bookify
        </Link>
        <span className="text-sm font-medium text-[#6B675E]">{savedBooks.length} ta asar</span>
      </header>

      <main className="max-w-3xl mx-auto p-4 pt-8">
        <h1 className="font-[var(--font-newsreader)] text-3xl font-bold mb-8">Saqlanganlar</h1>

        {loading ? (
          <div className="py-12 text-[#6B675E] text-sm">Yuklanmoqda...</div>
        ) : savedBooks.length > 0 ? (
          <div className="space-y-6">
            {savedBooks.map((book, i) => (
              <div 
                key={book.id || i} 
                className="flex items-start gap-4 p-4 bg-[#FBF8F1] border border-[#E3DCCB] rounded-md cursor-pointer hover:bg-[#F6F1E7] transition-colors"
                onClick={() => router.push(`/read/${book.id}`)}
              >
                <div className="w-16 h-24 shrink-0 rounded border border-[#E3DCCB] bg-[#E3DCCB] overflow-hidden">
                  <img 
                    src={resolveFileUrl(book.cover_image) || "/images/books/ref2.png"} 
                    alt={book.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 py-1">
                  <h3 className="font-[var(--font-newsreader)] font-bold text-base text-[#1B1A17] mb-1">{book.title}</h3>
                  <p className="text-xs text-[#6B675E] mb-3">{book.author || book.authorName || "Muallif nomaʼlum"}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/read/${book.id}`); }}
                      className="text-[#B4472B] hover:underline"
                    >
                      Oʻqish
                    </button>
                    <button 
                      onClick={(e) => handleRemove(book, e)}
                      className="text-[#6B675E] hover:text-[#1B1A17]"
                    >
                      Oʻchirish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20">
            <h2 className="font-[var(--font-newsreader)] text-2xl mb-2">Hali hech narsa saqlanmagan</h2>
            <p className="text-[#6B675E] text-sm mb-6">Yoqtirgan kitoblaringizni saqlab qoʻying, ular shu yerda koʻrinadi.</p>
            <Link href="/" className="text-sm border border-[#E3DCCB] rounded-md px-4 py-2 hover:bg-[#FBF8F1] transition-colors">
              Kitoblarni koʻrish
            </Link>
          </div>
        )}
      </main>

    </div>
  );
}