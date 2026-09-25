"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, BookOpen, Clock, Heart, User, Plus, Loader2, LogOut, Headphones } from "lucide-react";
import { api, getCachedUser, clearAuthToken, resolveFileUrl } from "@/services/api";

import { BOOKS } from "@/data/books";
import BookMoviesSection from "@/components/home/BookMoviesSection";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Auth Check
    const cached = getCachedUser();
    if (cached) setUser(cached);
    
    api.getMe().then(u => {
      if (u) setUser(u);
    }).catch(() => {});

    // Fetch Books
    api.getBooks()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBooks(data);
        } else {
          setBooks(BOOKS);
        }
      })
      .catch(err => {
        console.error("Failed to fetch books:", err);
        setBooks(BOOKS);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setIsMenuOpen(false);
  };

  const heroBook = books.length > 0 ? books[0] : null;
  const catalogBooks = books.slice(1);

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans pb-32">
      
      {/* iOS Style Minimal Top Header */}
      <header className="sticky top-0 z-40 bg-[#F5F5F7]/85 backdrop-blur-xl border-b border-black/5 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E05638] rounded-xl flex items-center justify-center shadow-sm shadow-[#E05638]/20">
            <span className="text-white font-serif font-bold text-lg leading-none">B</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Bookify</span>
        </Link>
        
        {user ? (
          <div className="relative flex items-center gap-2 sm:gap-3">
            {String(user.role || '').toLowerCase().includes('admin') && (
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200 transition-colors shadow-2xs"
              >
                <span>👑 Admin Panel</span>
              </Link>
            )}

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-2xs hover:shadow-sm transition-all border border-gray-200 cursor-pointer"
            >
              <div className="w-7 h-7 bg-orange-100 text-[#E05638] rounded-full flex items-center justify-center font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </div>
              <span className="text-xs font-bold text-gray-900 pr-1 max-w-[110px] truncate">{user.name || user.email || 'Foydalanuvchi'}</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in divide-y divide-gray-50">
                <div className="px-3 py-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user.role || 'Kitobxon'}</div>
                  <div className="text-xs font-bold text-gray-900 truncate mt-0.5">{user.name || user.email}</div>
                </div>
                
                <div className="py-1">
                  {String(user.role || '').toLowerCase().includes('admin') && (
                    <Link 
                      href="/admin" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                    >
                      <span>👑 Admin Panel</span>
                    </Link>
                  )}
                  <Link 
                    href="/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <User size={15} /> Profilim
                  </Link>
                  <Link 
                    href="/saved" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <Heart size={15} /> Saqlanganlar
                  </Link>
                </div>
                
                <div className="pt-1">
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut size={15} /> Chiqish
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link 
            href="/auth" 
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Kirish
          </Link>
        )}
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 pb-36 space-y-12">
        
        {/* Apple-style Hero Card */}
        {loading ? (
          <div className="w-full h-[400px] bg-white rounded-[32px] animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-400" size={32} />
          </div>
        ) : heroBook && (
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Tavsiya etamiz</h2>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Yangi Asar</span>
            </div>
            
            <div className="relative w-full h-auto min-h-[400px] bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left flex-1 max-w-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 font-bold text-[11px] uppercase tracking-wider rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  Hafta Asari
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 line-clamp-2">{heroBook.title}</h1>
                <p className="text-gray-500 font-medium mb-8 leading-relaxed line-clamp-3">
                  {heroBook.description || "Ushbu asar orqali yangi dunyolarni kashf eting va o'z bilimingizni boyiting."}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link href={`/read/${heroBook.id}`} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-orange-500/25 transition-transform active:scale-95 text-sm flex items-center justify-center gap-2">
                    <BookOpen size={18} />
                    Mutolaa qilish
                  </Link>
                  <Link href={`/book/${heroBook.id}`} className="bg-white hover:bg-gray-50 text-gray-900 font-bold py-3.5 px-6 rounded-full border border-gray-200 transition-transform active:scale-95 text-sm flex items-center justify-center gap-2">
                    <Headphones size={18} className="text-orange-500" />
                    Audio tinglash
                  </Link>
                </div>
              </div>

              <div className="relative z-10 w-full sm:w-auto flex justify-center mt-4 sm:mt-0">
                <Link href={`/book/${heroBook.id}`} className="w-[180px] aspect-[2/3] rounded-xl shadow-2xl overflow-hidden transform sm:rotate-3 transition-transform hover:rotate-0 duration-500 ring-1 ring-black/5 block cursor-pointer">
                  <img src={resolveFileUrl(heroBook.cover_image) || "/images/books/ref2.png"} alt={heroBook.title} className="w-full h-full object-cover bg-gray-100" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Clean Scroll Section */}
        {catalogBooks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5 px-2">
              <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Kutubxona & Sara Asarlar</h2>
              <span className="text-xs text-gray-400 font-medium">{catalogBooks.length} ta asar</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {catalogBooks.map(book => (
                <div key={book.id} className="group cursor-pointer block">
                  <Link href={`/book/${book.id}`} className="block">
                    <div className="bg-white rounded-[28px] p-6 aspect-[4/5] flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-4 transition-transform duration-300 group-hover:-translate-y-1 relative">
                      <div className="w-full max-w-[130px] aspect-[2/3] rounded-lg shadow-md overflow-hidden group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ring-1 ring-black/5">
                        <img src={resolveFileUrl(book.cover_image) || "/images/books/ref1.png"} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="px-2 space-y-1">
                      <h3 className="text-base font-bold text-gray-900 leading-tight truncate group-hover:text-orange-600 transition-colors">{book.title}</h3>
                      <p className="text-[13px] text-gray-500 font-medium truncate">{book.author || "Muallif noma'lum"}</p>
                    </div>
                  </Link>
                  <div className="px-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/read/${book.id}`}
                        className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                      >
                        <BookOpen size={12} /> O'qish
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link 
                        href={`/book/${book.id}`}
                        className="text-xs font-bold text-gray-600 hover:underline flex items-center gap-1"
                      >
                        <Headphones size={12} /> Audio
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Kinolar & Ekranlashtirishlar Bo'limi */}
        <BookMoviesSection />

        {/* Minimalist Action Widget */}
        <section>
          <div className="bg-white rounded-[32px] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                <Trophy size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Kitobxonlar Ligasi</h2>
                <p className="text-gray-500 text-sm font-medium">Bu haftada siz 12 soat mutolaa qildingiz.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-end">
              <div className="text-right hidden sm:block">
                <div className="text-2xl font-extrabold text-gray-900">#4</div>
                <div className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">O'rin</div>
              </div>
              <button className="h-12 w-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors shrink-0">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Floating Bottom Navigation Bar (iOS Style) */} 
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"> 
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[32px] p-2 flex items-center justify-between"> 
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-orange-500 hover:text-orange-600 transition-colors"> 
            <BookOpen size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Kutubxona</span> 
          </Link> 
          <Link href="/zen" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-900 transition-colors"> 
            <Clock size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Zen Mutolaa</span> 
          </Link> 
          <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-red-500 transition-colors"> 
            <Heart size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Saqlangan</span> 
          </Link> 
          <Link href="/profile" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-blue-500 transition-colors"> 
            <User size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Profil</span> 
          </Link>
        </div> 
      </div> 
 
    </div>
  );
}