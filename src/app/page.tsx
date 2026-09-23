"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, Trophy, BookOpen, Clock, Heart, User, Plus, Loader2, LogOut, 
  Headphones, Flame, Sparkles, Quote, Copy, Check, Play, Star, ChevronRight,
  Bookmark, Share2, Compass, Volume2, Award, Zap, CheckCircle2
} from "lucide-react";
import { api, getCachedUser, clearAuthToken, resolveFileUrl } from "@/services/api";
import { BOOKS } from "@/data/books";
import { AUTHORS } from "@/data/authors";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");

  // Streak & Reading Goal state (sample user stats)
  const streakDays = 5;
  const targetMinutes = 30;
  const completedMinutes = 24;
  const progressPercent = Math.min(100, Math.round((completedMinutes / targetMinutes) * 100));

  const weekDays = [
    { label: "D", done: true, name: "Dushanba" },
    { label: "S", done: true, name: "Seshanba" },
    { label: "Ch", done: true, name: "Chorshanba" },
    { label: "P", done: true, name: "Payshanba" },
    { label: "J", done: true, name: "Juma" },
    { label: "Sh", done: false, current: true, name: "Shanba (Bugun)" },
    { label: "Ya", done: false, name: "Yakshanba" },
  ];

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

  const handleCopyQuote = (quoteText: string) => {
    navigator.clipboard.writeText(quoteText);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  const displayBooks = books.length > 0 ? books : BOOKS;
  const heroBook = displayBooks.length > 0 ? displayBooks[0] : null;
  const catalogBooks = displayBooks.slice(1);

  // Audiobooks Showcase collection
  const audioBooksList = [
    {
      id: "otkan-kunlar",
      title: "O'tkan Kunlar",
      author: "Abdulla Qodiriy",
      duration: "11 soat 40 daqiqa",
      chaptersCount: 16,
      narrator: "O'zbekiston Milliy Radiosi oltin fondi",
      cover: "/images/books/ref2.png",
      rating: 4.9,
      accent: "from-amber-600 to-orange-700"
    },
    {
      id: "jinoyat-va-jazo",
      title: "Jinoyat va Jazo",
      author: "Fyodor Dostoyevskiy",
      duration: "18 soat 15 daqiqa",
      chaptersCount: 24,
      narrator: "Professional aktyorlar jamoasi",
      cover: "https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg",
      rating: 4.9,
      accent: "from-blue-900 to-indigo-950"
    },
    {
      id: "dunyoning-ishlari",
      title: "Dunyoning Ishlari",
      author: "O'tkir Hoshimov",
      duration: "6 soat 30 daqiqa",
      chaptersCount: 12,
      narrator: "O'zbekiston xalq artisti",
      cover: "/images/books/ref1.png",
      rating: 4.8,
      accent: "from-emerald-700 to-teal-900"
    },
    {
      id: "kecha-va-kunduz",
      title: "Kecha va Kunduz",
      author: "Abdulhamid Cho'lpon",
      duration: "9 soat 10 daqiqa",
      chaptersCount: 14,
      narrator: "Akademik badiiy jamoa",
      cover: "/images/books/ref3.png",
      rating: 4.9,
      accent: "from-violet-800 to-purple-950"
    },
    {
      id: "yulduzli-tunlar",
      title: "Yulduzli Tunlar",
      author: "Pirimqul Qodirov",
      duration: "15 soat 45 daqiqa",
      chaptersCount: 20,
      narrator: "Davlat teleradio kompaniyasi",
      cover: "/images/books/ref2.png",
      rating: 4.9,
      accent: "from-red-900 to-stone-900"
    }
  ];

  // Filter catalog based on selectedCategory
  const filteredCatalog = catalogBooks.filter(book => {
    if (selectedCategory === "Barchasi") return true;
    if (selectedCategory === "O'zbek adabiyoti") {
      return (book.author || book.authorName || "").match(/Qodiriy|Cho'lpon|Hoshimov|Oybek|G'ulom|Qodirov/i);
    }
    if (selectedCategory === "Jahon klassikasi") {
      return (book.author || book.authorName || "").match(/Dostoyevskiy|Tolstoy|Kafka|Cervantes|Dumas|London/i);
    }
    if (selectedCategory === "Audioli asarlar") {
      return Boolean(book.audio_url || book.audioDuration || true);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans pb-32">
      
      {/* Top Header (Full Width max-w-7xl) */}
      <header className="sticky top-0 z-40 bg-[#F5F5F7]/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#E05638] to-[#C93B1D] rounded-xl flex items-center justify-center shadow-sm shadow-[#E05638]/25 group-hover:scale-105 transition-transform">
              <span className="text-white font-serif font-bold text-xl leading-none">B</span>
            </div>
            <div>
              <span className="font-extrabold text-gray-900 text-lg tracking-tight block leading-none">Bookify</span>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Raqamli Mutolaa</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-xs font-bold text-gray-900 hover:text-orange-600 transition-colors">
              Bosh sahifa
            </Link>
            <Link href="/zen" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
              <Clock size={14} className="text-orange-500" /> Zen Rejim
            </Link>
            <Link href="/saved" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
              <Heart size={14} /> Saqlanganlar
            </Link>
          </div>
          
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
                <span className="text-xs font-bold text-gray-900 pr-1 max-w-[120px] truncate">{user.name || user.email || 'Foydalanuvchi'}</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in divide-y divide-gray-50">
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
                    <Link 
                      href="/zen" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Clock size={15} /> Zen Mutolaa
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
        </div>
      </header>
      
      {/* Main Content (Wide Layout max-w-7xl) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mt-6 space-y-14">
        
        {/* SECTION 7: Daily Reading Goal & Streak Tracker Widget */}
        <section className="bg-white rounded-[28px] p-5 sm:p-6 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-orange-50/60 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            
            {/* Left: Streak & Today's Goal */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                  <Flame size={28} className="animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-gray-900 tracking-tight">{streakDays} Kunlik Seriya</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase rounded-full">Olovli!</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Har kuni o'qish orqali o'z odatingizni mustahkamlang</p>
                </div>
              </div>

              {/* Day Streak Pills */}
              <div className="flex items-center gap-1.5 sm:ml-4 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
                {weekDays.map((d, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col items-center justify-center w-8 h-10 rounded-xl transition-all ${
                      d.done 
                        ? 'bg-orange-500 text-white font-bold shadow-xs' 
                        : (d.current ? 'bg-orange-100 text-orange-700 font-extrabold ring-1 ring-orange-400' : 'text-gray-400 font-medium')
                    }`}
                    title={d.name}
                  >
                    <span className="text-[10px] leading-none mb-1">{d.label}</span>
                    {d.done ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${d.current ? 'bg-orange-500 animate-ping' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Progress Bar & Zen Action */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
              <div className="min-w-[180px] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <Clock size={12} className="text-orange-500" /> Bugun: <strong className="text-gray-900 font-bold">{completedMinutes} daq</strong>
                  </span>
                  <span className="font-extrabold text-orange-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-[#E05638] rounded-full transition-all duration-700" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-gray-400 text-right">Maqsad: {targetMinutes} daqiqa</div>
              </div>

              <Link 
                href="/zen" 
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-full font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <Clock size={14} className="text-orange-400" />
                <span>Zen Mutolaa</span>
              </Link>
            </div>

          </div>
        </section>

        {/* SECTION 8: Apple-style Expanded Hero Card */}
        {loading ? (
          <div className="w-full h-[420px] bg-white rounded-[32px] animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-400" size={32} />
          </div>
        ) : heroBook && (
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-orange-500" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Tahririyat Tanlovi</h2>
              </div>
              <span className="text-xs font-bold text-orange-700 bg-orange-100/80 border border-orange-200/60 px-3.5 py-1 rounded-full">
                Hafta Durdonasi
              </span>
            </div>
            
            <div className="relative w-full bg-white rounded-[36px] overflow-hidden shadow-[0_12px_40px_rgb(0,0,0,0.04)] border border-gray-100/70 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Hero Details */}
              <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 font-bold text-[11px] uppercase tracking-wider rounded-full border border-orange-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    Klassika & Bestseller
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 font-bold text-[11px] rounded-full">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    4.9 Reyting
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-2 leading-tight">
                  {heroBook.title}
                </h1>
                <p className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
                  {heroBook.author || heroBook.authorName || "Abdulla Qodiriy"}
                </p>

                <p className="text-gray-500 text-sm sm:text-base font-normal mb-8 leading-relaxed max-w-2xl line-clamp-3">
                  {heroBook.description || "Ushbu asar o'zbek adabiyotining eng yorqin sahifalaridan biridir. Asarda muhabbat, sadoqat va milliy an'analar teran psixologik mahorat bilan yoritilgan."}
                </p>

                {/* Key Metrics Chips */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8 text-xs text-gray-500 font-semibold">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <BookOpen size={14} className="text-orange-500" />
                    <span>574 bet</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <Headphones size={14} className="text-orange-500" />
                    <span>Audio versiya mavjud</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>To'liq matn</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
                  <Link 
                    href={`/read/${heroBook.id}`} 
                    className="bg-[#E05638] hover:bg-[#c93b1d] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-orange-500/25 transition-transform active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen size={18} />
                    Mutolaa qilish
                  </Link>
                  <Link 
                    href={`/book/${heroBook.id}`} 
                    className="bg-white hover:bg-gray-50 text-gray-900 font-bold py-3.5 px-7 rounded-full border border-gray-200 transition-transform active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Headphones size={18} className="text-orange-500" />
                    Audio tinglash
                  </Link>
                </div>
              </div>

              {/* 3D Book Cover Presentation */}
              <div className="relative z-10 shrink-0 mt-4 lg:mt-0">
                <div className="relative group">
                  <div className="w-[210px] sm:w-[240px] aspect-[2/3] rounded-2xl shadow-2xl overflow-hidden transform lg:rotate-3 transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 ring-1 ring-black/10 bg-gray-100">
                    <img 
                      src={resolveFileUrl(heroBook.cover_image) || "/images/books/ref2.png"} 
                      alt={heroBook.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {/* Subtle 3D page edge effect */}
                  <div className="absolute right-0 top-2 bottom-2 w-3 bg-gradient-to-r from-gray-200 to-white rounded-r-sm shadow-md pointer-events-none transform lg:rotate-3 group-hover:rotate-0 transition-transform"></div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* SECTION 3: Audiobooks Showcase Section */}
        <section>
          <div className="flex items-center justify-between mb-5 px-2">
            <div>
              <div className="flex items-center gap-2">
                <Headphones size={22} className="text-orange-500" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Sara Audiokitoblar</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Professional suxandonlar va audio-spektakllar bilan asarlardan bahramand bo'ling</p>
            </div>
            <Link 
              href="/catalog?filter=audio" 
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>Hammasi</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
            {audioBooksList.map((audioBook) => (
              <Link 
                key={audioBook.id} 
                href={`/book/${audioBook.id}`}
                className="group bg-white rounded-[26px] p-4 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Cover with Play Badge Overlay */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3.5 bg-gray-100 ring-1 ring-black/5">
                    <img 
                      src={audioBook.cover} 
                      alt={audioBook.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/95 text-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={20} className="ml-0.5 fill-orange-600" />
                      </div>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white rounded-lg text-[10px] font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1"><Volume2 size={11} /> {audioBook.duration}</span>
                      <span>⭐ {audioBook.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {audioBook.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold line-clamp-1 mt-0.5">
                    {audioBook.author}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                  <span className="truncate max-w-[130px]">{audioBook.chaptersCount} ta audio bob</span>
                  <span className="text-orange-600 font-bold group-hover:underline">Tinglash</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 4: Top Authors Gallery */}
        <section>
          <div className="flex items-center justify-between mb-5 px-2">
            <div>
              <div className="flex items-center gap-2">
                <Award size={22} className="text-orange-500" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Sevimli Adiblar & Klassiklar</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">O'zbek va jahon adabiyotining eng ulug' namoyandalari</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {AUTHORS.slice(0, 6).map((author) => (
              <div 
                key={author.id}
                className="bg-white rounded-[26px] p-4 text-center border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 group flex flex-col items-center justify-between"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 ring-3 ring-orange-100 group-hover:ring-orange-400 transition-all shadow-md">
                  <img 
                    src={author.portrait} 
                    alt={author.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-gray-100" 
                  />
                </div>

                <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm leading-tight mb-1 group-hover:text-orange-600 transition-colors">
                  {author.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-medium block mb-2">{author.lifetime}</span>
                
                <span className="inline-block px-2.5 py-0.5 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-full border border-gray-100">
                  {author.booksCount} ta asar
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Literary Quote of the Day Card */}
        <section className="relative rounded-[32px] bg-gradient-to-br from-gray-900 via-[#18181b] to-black text-white p-7 sm:p-10 lg:p-12 overflow-hidden shadow-2xl border border-white/10">
          {/* Subtle Background Glow & Watermark */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-600/20 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="absolute right-6 -bottom-8 text-white/5 font-serif text-[180px] font-black select-none pointer-events-none leading-none">
            “
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 font-extrabold text-[11px] uppercase tracking-wider rounded-full border border-orange-500/30">
                Kunning Ilhomlantiruvchi Iqtibosi
              </span>
            </div>

            <blockquote className="font-serif text-lg sm:text-2xl lg:text-3xl font-medium leading-relaxed sm:leading-snug text-gray-100 mb-6 italic">
              "Modomiki, biz yangi davrga oyoq qo'ydik, bas, biz har bir yo'nalishda yangiliklar orqasidan ergashmog'imiz lozim."
            </blockquote>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-5">
              <div>
                <cite className="font-bold text-base text-white not-italic block">Abdulla Qodiriy</cite>
                <span className="text-xs text-orange-300/80 font-medium">«O'tkan Kunlar» romanidan</span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleCopyQuote("Modomiki, biz yangi davrga oyoq qo'ydik, bas, biz har bir yo'nalishda yangiliklar orqasidan ergashmog'imiz lozim. — Abdulla Qodiriy")}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedQuote ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  <span>{copiedQuote ? "Nusxa olindi!" : "Iqtibosdan nusxa olish"}</span>
                </button>

                <Link 
                  href="/read/otkan-kunlar"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-bold shadow-md shadow-orange-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>Asarni o'qish</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog & Filter Pills Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Kutubxona & Barcha Asarlar</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Har qanday qiziqish va did uchun boy adabiy meros</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {["Barchasi", "O'zbek adabiyoti", "Jahon klassikasi", "Audioli asarlar"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredCatalog.map(book => (
              <div key={book.id} className="group cursor-pointer block">
                <div className="bg-white rounded-[28px] p-5 aspect-[4/5] flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-3.5 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl relative border border-gray-100">
                  <div className="w-full max-w-[130px] aspect-[2/3] rounded-lg shadow-md overflow-hidden group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 ring-1 ring-black/5 bg-gray-100">
                    <img 
                      src={resolveFileUrl(book.cover_image) || "/images/books/ref1.png"} 
                      alt={book.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                <div className="px-1.5 space-y-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight truncate group-hover:text-orange-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold truncate">
                    {book.author || book.authorName || "Muallif noma'lum"}
                  </p>
                  <div className="flex items-center gap-2 pt-1.5">
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

        {/* Minimalist Action & Community Widget */}
        <section>
          <div className="bg-white rounded-[32px] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-[#E05638] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                <Trophy size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Kitobxonlar Ligasi</h2>
                <p className="text-gray-500 text-sm font-medium">Bu haftada siz 12 soat mutolaa qildingiz va 4-o'rindasiz.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-end">
              <div className="text-right hidden sm:block">
                <div className="text-2xl font-extrabold text-gray-900">#4</div>
                <div className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">O'rin</div>
              </div>
              <Link 
                href="/zen" 
                className="h-12 w-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors shrink-0"
              >
                <ArrowRight size={20} />
              </Link>
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