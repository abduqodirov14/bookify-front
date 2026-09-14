"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, BookOpen, Clock, Heart, User, Plus, Loader2, LogOut } from "lucide-react";
import { api, getCachedUser, clearAuthToken, resolveFileUrl } from "@/services/api";

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
        setBooks(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to fetch books:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setIsMenuOpen(false);
  };

  const heroBook = books.length > 0 ? books[0] : null;
  const legacyBooks = books.slice(1, 5);

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans pb-32">
      
      {/* iOS Style Minimal Navbar */}
      <nav className="sticky top-0 z-50 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-black/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm shadow-orange-500/20">
            <span className="text-white font-bold text-lg leading-none">B</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg tracking-tight">Bookify</span>
        </div>
        
        {user ? (
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-gray-200">
              <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-bold text-gray-900 pr-1 max-w-[100px] truncate">{user.name || 'User'}</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-gray-50 mb-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{user.role || 'USER'}</div>
                  <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
                </div>
                
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <User size={16} /> Admin Panel
                  </Link>
                )}
                {user.role === 'SCHOOL_DIRECTOR' && (
                  <Link href="/director" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <User size={16} /> Direktor Panel
                  </Link>
                )}
                {user.role === 'LIBRARIAN' && (
                  <Link href="/librarian" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <BookOpen size={16} /> Kutubxona Panel
                  </Link>
                )}
                
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1">
                  <LogOut size={16} /> Chiqish
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth" className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-bold shadow-md shadow-black/10 hover:bg-black transition-colors active:scale-95">Kirish</Link>
        )}
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-12">
        
        {/* Apple-style Hero Card */}
        {loading ? (
          <div className="w-full h-[400px] bg-white rounded-[32px] animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-400" size={32} />
          </div>
        ) : heroBook && (
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Tavsiya etamiz</h2>
              <button className="text-orange-500 font-semibold text-sm hover:opacity-80 transition-opacity">Barchasi</button>
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
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <Link href={`/book/${heroBook.id}`} className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-orange-500/25 transition-transform active:scale-95 text-sm flex items-center justify-center">
                    Mutolaani boshlash
                  </Link>
                </div>
              </div>

              <div className="relative z-10 w-full sm:w-auto flex justify-center mt-4 sm:mt-0">
                <div className="w-[180px] aspect-[2/3] rounded-xl shadow-2xl overflow-hidden transform sm:rotate-3 transition-transform hover:rotate-0 duration-500 ring-1 ring-black/5">
                  <img src={resolveFileUrl(heroBook.cover_image) || "/images/books/ref2.png"} alt={heroBook.title} className="w-full h-full object-cover bg-gray-100" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Clean Scroll Section */}
        {legacyBooks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5 px-2">
              <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Kutubxona</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {legacyBooks.map(book => (
                <Link key={book.id} href={`/book/${book.id}`} className="group cursor-pointer block">
                  <div className="bg-white rounded-[28px] p-6 aspect-[4/5] flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="w-full max-w-[130px] aspect-[2/3] rounded-lg shadow-md overflow-hidden group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ring-1 ring-black/5">
                      <img src={resolveFileUrl(book.cover_image) || "/images/books/ref1.png"} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{book.title}</h3>
                    <p className="text-[13px] text-gray-500 font-medium mt-1 truncate">{book.author || "Muallif noma'lum"}</p>
                  </div>
                </Link>
              ))}
              
              <div className="group cursor-pointer block">
                <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[28px] p-6 aspect-[4/5] flex flex-col items-center justify-center mb-4 transition-colors group-hover:border-orange-200 group-hover:bg-orange-50/50">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-orange-500 transition-colors mb-3">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-semibold text-gray-500 group-hover:text-orange-600">Yana kashf etish</span>
                </div>
              </div>
            </div>
          </section>
        )}

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