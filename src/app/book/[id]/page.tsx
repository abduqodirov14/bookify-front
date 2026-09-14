"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, BookOpen, Headphones, Star, Share2, Heart, Clock, 
  MoreHorizontal, MessageSquare, Send, X, Copy, 
  BookmarkPlus, Flag, User, Smartphone, ChevronDown, 
  Play, Pause, SkipBack, SkipForward, ListMusic, Gauge, Moon
} from "lucide-react";
import { BOOKS } from "@/data/books";
import { api, resolveFileUrl } from "@/services/api";

export default function BookDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [playerState, setPlayerState] = useState<'closed' | 'mini' | 'full'>('closed');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isZenModalOpen, setIsZenModalOpen] = useState(false);
  const [zenTime, setZenTime] = useState(30);

  const [liveBook, setLiveBook] = useState<any>(null);

  React.useEffect(() => {
    if (!id) return;
    api.getBookById(id)
      .then(b => setLiveBook(b))
      .catch(() => {
        api.getBooks().then(books => {
          const found = books.find((b: any) => b.id === id);
          if (found) setLiveBook(found);
        }).catch(() => {});
      });
  }, [id]);

  const fallbackBook = BOOKS.find(b => b.id === id) || BOOKS[0];
  const book = liveBook ? {
    ...fallbackBook,
    ...liveBook,
    authorName: liveBook.author || fallbackBook.authorName,
    title: liveBook.title || fallbackBook.title,
    description: liveBook.description || fallbackBook.description,
  } : fallbackBook;

  const coverImage = liveBook?.cover_image 
    ? resolveFileUrl(liveBook.cover_image) 
    : (book.id === "1" ? "/images/books/ref2.png" : (book.id === "2" ? "/images/books/ref3.png" : book.coverImage || "/images/books/ref2.png"));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Bookify orqali "${book.title}" asarini o'qing!`,
          url: window.location.href,
        });
      } catch (err) {
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans pb-32 relative">
      
      {/* --- AUDIO PLAYER (MINI & FULL) --- */}
      
      {/* FULL SCREEN PLAYER */}
      <div 
        className={`fixed inset-0 z-[200] bg-[#F5F5F7] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${playerState === 'full' ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Blurred ambient background for player */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-300/30 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between p-6 pt-10">
           <button onClick={() => setPlayerState('mini')} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer active:scale-95">
             <ChevronDown size={32} />
           </button>
           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] bg-white/50 px-4 py-1.5 rounded-full">Audio Mutolaa</div>
           <button className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer">
             <MoreHorizontal size={28} />
           </button>
        </div>

        {/* Album Art & Controls */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto w-full gap-10">
           <div className={`w-[260px] sm:w-[320px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgb(0,0,0,0.15)] ring-1 ring-black/5 transition-transform duration-700 ease-out ${isPlaying ? 'scale-100' : 'scale-95'}`}>
             <img src={coverImage} alt={book.title} className="w-full h-full object-cover" />
           </div>

           {/* Title */}
           <div className="text-center w-full">
             <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{book.id === "1" ? "O'tkan Kunlar" : (book.id === "2" ? "Jinoyat va Jazo" : book.title)}</h2>
             <p className="text-lg text-gray-500 font-semibold mt-1">{book.authorName}</p>
           </div>

           {/* Progress Bar */}
           <div className="w-full pt-4">
             <div className="group w-full h-3 bg-gray-200/80 rounded-full overflow-hidden relative cursor-pointer flex items-center">
               <div className="absolute top-0 left-0 h-full w-[45%] bg-orange-500 rounded-full"></div>
             </div>
             <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mt-3 tracking-wider">
               <span>12:32</span>
               <span>- 13:09</span>
             </div>
           </div>

           {/* Playback Controls */}
           <div className="flex items-center justify-center gap-10 w-full px-4 pt-4">
             <button className="text-gray-400 hover:text-gray-800 transition-colors active:scale-90"><SkipBack size={36} fill="currentColor" /></button>
             <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
             >
               {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
             </button>
             <button className="text-gray-400 hover:text-gray-800 transition-colors active:scale-90"><SkipForward size={36} fill="currentColor" /></button>
           </div>
        </div>

        {/* Bottom Tools */}
        <div className="relative z-10 flex items-center justify-around py-8 px-6 bg-white/40 border-t border-gray-100 backdrop-blur-xl mt-8">
           <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
             <ListMusic size={24} />
             <span className="text-[10px] font-bold uppercase tracking-wider">Mundarija</span>
           </button>
           <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
             <Gauge size={24} />
             <span className="text-[10px] font-bold uppercase tracking-wider">1.25x</span>
           </button>
           <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
             <Moon size={24} />
             <span className="text-[10px] font-bold uppercase tracking-wider">Uyqu</span>
           </button>
        </div>
      </div>

      {/* MINI PLAYER */}
      <div 
        onClick={() => setPlayerState('full')}
        className={`fixed z-[150] bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl border-t border-black/5 p-3 sm:px-6 flex items-center justify-between transition-transform duration-500 cursor-pointer shadow-[0_-10px_40px_rgb(0,0,0,0.08)] ${playerState === 'mini' ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Animated mini progress bar at the very top edge of the mini player */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200">
          <div className="h-full w-[45%] bg-orange-500"></div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className={`w-12 h-12 rounded-lg overflow-hidden shadow-sm shrink-0 ${isPlaying ? 'animate-[spin_8s_linear_infinite] rounded-full' : ''}`}>
            <img src={coverImage} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 truncate">
            <div className="text-sm font-bold text-gray-900 truncate">
              {book.id === "1" ? "O'tkan Kunlar" : (book.id === "2" ? "Jinoyat va Jazo" : book.title)}
            </div>
            <div className="text-[11px] font-medium text-gray-500 truncate">{book.authorName}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pl-4 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-200 active:scale-95 transition-all"
          >
             {isPlaying ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} className="ml-1" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setPlayerState('closed'); }} 
            className="text-gray-400 hover:text-gray-700 p-2"
          >
             <X size={20} />
          </button>
        </div>
      </div>
      {/* --- END AUDIO PLAYER --- */}

      {/* --- MODALS --- */}
      
      {/* 1. SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}></div>
          <div className="relative bg-white/90 backdrop-blur-2xl w-full max-w-sm rounded-[32px] p-6 shadow-[0_20px_40px_rgb(0,0,0,0.1)] transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Ulashish</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <button className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 active:scale-95 transition-transform"><Send size={20} /></div>
                <span className="text-[10px] font-bold text-gray-600">Telegram</span>
              </button>
              <button className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-pink-500/20 active:scale-95 transition-transform"><Smartphone size={20} /></div>
                <span className="text-[10px] font-bold text-gray-600">Instagram</span>
              </button>
              <button className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-600/20 active:scale-95 transition-transform"><Smartphone size={20} /></div>
                <span className="text-[10px] font-bold text-gray-600">Facebook</span>
              </button>
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 ${isCopied ? 'bg-green-500' : 'bg-gray-200 text-gray-700'} rounded-2xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all`}>
                  <Copy size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-600">{isCopied ? 'Nusxa olindi' : 'Nusxa olish'}</span>
              </button>
            </div>
            <div className="p-3 bg-gray-100 rounded-2xl flex items-center justify-between gap-3 border border-gray-200/50">
              <span className="text-xs font-medium text-gray-500 truncate flex-1">bookify.uz/book/{id}</span>
              <button onClick={handleCopyLink} className="text-orange-500 font-bold text-xs uppercase tracking-wider hover:opacity-80">Nusxa</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MORE OPTIONS MODAL */}
      {isMoreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMoreModalOpen(false)}></div>
          <div className="relative bg-white/90 backdrop-blur-2xl w-full max-w-xs rounded-[32px] p-2 shadow-[0_20px_40px_rgb(0,0,0,0.1)] transform transition-all flex flex-col gap-1">
            <button className="flex items-center gap-4 w-full p-4 hover:bg-gray-100/80 rounded-[24px] transition-colors text-left group">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                <BookmarkPlus size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Javonga qo'shish</div>
                <div className="text-[11px] font-medium text-gray-500">Kitobni saqlanganlarga olish</div>
              </div>
            </button>
            <button className="flex items-center gap-4 w-full p-4 hover:bg-gray-100/80 rounded-[24px] transition-colors text-left group">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                <User size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Muallif sahifasi</div>
                <div className="text-[11px] font-medium text-gray-500">Boshqa asarlarni ko'rish</div>
              </div>
            </button>
            <div className="h-px bg-gray-200/50 my-1 mx-4"></div>
            <button className="flex items-center gap-4 w-full p-4 hover:bg-red-50/80 rounded-[24px] transition-colors text-left group">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
                <Flag size={20} />
              </div>
              <div>
                <div className="font-bold text-red-600 text-sm">Shikoyat qilish</div>
                <div className="text-[11px] font-medium text-red-400">Xatolik yoki muammo bo'lsa</div>
              </div>
            </button>
          </div>
        </div>

      )}


      


      

      
      {/* Ambient Background Layer (Absolute to not cut off content) */}
      <div className="absolute top-0 left-0 w-full h-[500px] sm:h-[550px] overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <div className="absolute inset-0 bg-[#F5F5F7]/80 backdrop-blur-[80px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F5F5F7]/50 to-[#F5F5F7]"></div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="relative z-20 pt-6 px-6 max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="w-10 h-10 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 transition-colors shadow-sm cursor-pointer">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleNativeShare}
            className="w-10 h-10 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setIsMoreModalOpen(true)}
            className="w-10 h-10 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Book Info Container */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 pt-12 sm:pt-24 pb-8">
        
        {/* 3D-ish Book Cover */}
        <div className="w-[200px] sm:w-[260px] aspect-[2/3] shrink-0 rounded-[20px] shadow-[0_20px_50px_rgb(0,0,0,0.15)] ring-1 ring-black/5 overflow-hidden">
          <img src={coverImage} alt={book.title} className="w-full h-full object-cover" />
        </div>

        {/* Book Metadata */}
        <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur-md text-gray-800 font-bold text-[11px] uppercase tracking-wider rounded-full mb-4 shadow-sm border border-white/20">
            Klassik Asar
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-2 leading-tight">
            {book.id === "1" ? "O'tkan Kunlar" : (book.id === "2" ? "Jinoyat va Jazo" : book.title)}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 font-semibold mb-6">
            {book.authorName}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-gray-600 mb-8 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-orange-500 text-orange-500" />
              <span className="font-bold text-gray-900">4.9</span>
              <span>(1.2k sharh)</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            <div>342 bet</div>
            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            <div>12 soat (Audio)</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href={`/read/${id}`} className="w-full sm:w-auto px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2">
              <BookOpen size={20} />
              O'qish
            </Link>
            <button 
              onClick={() => setPlayerState('full')}
              className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-full shadow-sm shadow-black/5 transition-transform active:scale-95 border border-gray-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Headphones size={20} />
              Tinglash
            </button>
          </div>

          {/* 3-Button Action Pill (Kutubxona, Zen Mutolaa, Saqlangan) */}
          <div className="w-full sm:w-[400px] mt-8 bg-white rounded-[32px] shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-gray-100 p-2 flex items-center justify-between relative z-30">
            <Link href="/" className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5 hover:bg-orange-50/50 rounded-[24px] transition-colors cursor-pointer group">
              <BookOpen size={24} className="text-orange-500" strokeWidth={2} />
              <span className="text-[11px] font-extrabold text-orange-500 tracking-wide">Kutubxona</span>
            </Link>
            
            <Link href="/zen" className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5 hover:bg-slate-50/50 rounded-[24px] transition-colors cursor-pointer group">
              <Clock size={24} className="text-[#5B6371] group-hover:text-slate-900" strokeWidth={2} />
              <span className="text-[11px] font-extrabold text-[#5B6371] group-hover:text-slate-900 tracking-wide">Zen Mutolaa</span>
            </Link>

            <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5 hover:bg-red-50/50 rounded-[24px] transition-colors cursor-pointer group">
              <Heart size={24} className="text-[#87909E] group-hover:text-red-500" strokeWidth={2} />
              <span className="text-[11px] font-extrabold text-[#87909E] group-hover:text-red-500 tracking-wide">Saqlangan</span>
            </Link>
          </div>


          

        </div>
      </div>

      {/* Content Section (Synopsis & Details) */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 mt-8 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-8 space-y-12">
          {/* Synopsis */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Asar haqida</h3>
            <p className="text-gray-600 leading-relaxed font-medium text-[15px]">
              Kishi o'ziga ma'lum bo'lmagan narsalardan doim qo'rqadi. Agar bilsa, qo'rqmasdi. Afsuski, insoniyat hamisha o'zi bilmagan tomonga qarab ketmoqda...
              Bu buyuk asar inson va tabiat o'rtasidagi munosabatlarni, jamiyatdagi illatlarni, vijdonsizlik va xudbinlikni o'ta teran falsafiy ruhda ochib beradi.
            </p>
          </section>

          {/* New Clean Reviews Section */}
          <section>
            <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Kitobxonlar fikri</h3>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-900">1,245 ta fikr</span>
              </div>

              {/* Input Form */}
              <div className="bg-[#F5F5F7] p-5 sm:p-6 rounded-[24px] mb-8 space-y-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95">
                      <Star size={24} className="fill-gray-300 text-gray-300 hover:fill-orange-500 hover:text-orange-500 transition-colors" />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  placeholder="Asar sizga qanday ta'sir qildi?"
                  className="w-full px-5 py-4 rounded-[20px] bg-white border-none text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-orange-500/50 resize-none placeholder:text-gray-400 shadow-sm"
                />
                <div className="flex justify-end pt-2">
                  <button className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-transform active:scale-95 shadow-lg shadow-orange-500/30 flex items-center gap-2">
                    <Send size={16} /> Yuborish
                  </button>
                </div>
              </div>

              {/* Sample Review */}
              <div className="space-y-4">
                <div className="p-5 sm:p-6 rounded-[24px] bg-[#F5F5F7] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">
                        S
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">Sardorbek</div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5">2 soat oldin</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <Star key={i} size={14} className="fill-orange-500 text-orange-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed pl-1 pt-2">
                    Juda kuchli asar. Insoniyatning kelajagi haqida o'ylashga majbur qiladi. Tavsiya qilaman!
                  </p>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* Sidebar Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4">Muallif</h4>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                {book.authorName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900">{book.authorName}</div>
                <div className="text-xs font-medium text-gray-500">Taniqli yozuvchi</div>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-[#F5F5F7] hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors">
              Barcha asarlari
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
             <h4 className="font-bold text-gray-900 mb-4">Tafsilotlar</h4>
             <ul className="space-y-3 text-sm font-medium">
               <li className="flex justify-between text-gray-500"><span className="text-gray-400">Nashriyot:</span> Asaxiy Books</li>
               <li className="flex justify-between text-gray-500"><span className="text-gray-400">Yil:</span> 2022</li>
               <li className="flex justify-between text-gray-500"><span className="text-gray-400">Til:</span> O'zbekcha</li>
               <li className="flex justify-between text-gray-500"><span className="text-gray-400">Hajmi:</span> 342 bet</li>
               <li className="flex justify-between text-gray-500"><span className="text-gray-400">Janr:</span> Falsafiy roman</li>
             </ul>
          </div>
        </div>
    </div>
      {/* Floating Bottom Navigation Bar (iOS Style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[32px] p-2 flex items-center justify-between">
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-orange-500 transition-colors">
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