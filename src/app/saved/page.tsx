"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, resolveFileUrl } from "@/services/api";
import { 
  ArrowLeft, Heart, BookOpen, Clock, MoreVertical, User, Loader2, 
  Headphones, Share2, Trash2, X, CheckCircle2 
} from "lucide-react";

export default function SavedPage() {
  const router = useRouter();
  const [savedBooks, setSavedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuBook, setActiveMenuBook] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const loadSaved = () => {
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
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleToggleLike = async (book: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const bookId = book.id;
    const isCurrentlySaved = savedBooks.some(b => b.id === bookId);

    if (isCurrentlySaved) {
      setSavedBooks(prev => prev.filter(b => b.id !== bookId));
      showToast(`"${book.title}" saqlanganlardan olib tashlandi`);
      try {
        await api.removeFromLibrary(bookId);
      } catch {}
    } else {
      setSavedBooks(prev => [book, ...prev]);
      showToast(`"${book.title}" saqlandi`);
      try {
        await api.addToLibrary(bookId);
      } catch {}
    }
  };

  const handleShare = (book: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/book/${book.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast("Havola nusxalandi!");
    }
    setActiveMenuBook(null);
  };

  const handleRemove = async (book: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
    showToast(`"${book.title}" o'chirildi`);
    setActiveMenuBook(null);
    try {
      await api.removeFromLibrary(book.id);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Saqlanganlar</h1>
        <span className="text-xs font-bold text-gray-400">{savedBooks.length} ta asar</span>
      </header>

      {/* Content */}
      <main className="p-6 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : savedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBooks.map((book, i) => (
              <div 
                key={book.id || i} 
                onClick={() => router.push(`/book/${book.id}`)}
                className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex gap-4 items-center group relative overflow-hidden transition-all hover:shadow-md cursor-pointer"
              >
                <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                  <img 
                    src={resolveFileUrl(book.cover_image) || "/images/books/ref2.png"} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="inline-block px-2 py-0.5 bg-orange-50 text-orange-600 font-bold text-[10px] rounded-full mb-1.5 uppercase tracking-wide">
                    Audio & Matn
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{book.title}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-3 truncate">{book.author || book.authorName || "Muallif noma'lum"}</p>
                  
                  <div className="flex items-center gap-2">
                    {/* Heart (Like) Button */}
                    <button 
                      onClick={(e) => handleToggleLike(book, e)}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all active:scale-90"
                      title="Saqlash / O'chirish"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>

                    {/* Three Dots Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuBook(book); }}
                      className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all active:scale-90"
                      title="Qo'shimcha amallar"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-6">
              <Heart size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hali hech narsa saqlanmagan</h2>
            <p className="text-gray-500 text-sm max-w-xs">Yoqtirgan kitoblaringizdagi yurakcha tugmasini bosing, ular shu yerda jamlanadi.</p>
            <Link href="/" className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full font-bold shadow-lg shadow-black/10 active:scale-95 transition-transform">
              Kitoblarni ko'rish
            </Link>
          </div>
        )}
      </main>

      {/* --- THREE DOTS ACTIONS MODAL / POPUP --- */}
      {activeMenuBook && (
        <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setActiveMenuBook(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl z-10 animate-slide-up">
            
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img 
                  src={resolveFileUrl(activeMenuBook.cover_image) || "/images/books/ref2.png"} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 truncate">
                <h4 className="font-bold text-gray-900 text-sm truncate">{activeMenuBook.title}</h4>
                <p className="text-xs text-gray-500 truncate">{activeMenuBook.author || "Muallif"}</p>
              </div>
              <button onClick={() => setActiveMenuBook(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <button 
                onClick={() => { router.push(`/read/${activeMenuBook.id}`); setActiveMenuBook(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-800 font-bold text-sm transition-colors"
              >
                <BookOpen size={18} className="text-orange-500" />
                <span>Mutolaa qilish</span>
              </button>

              <button 
                onClick={() => { router.push(`/book/${activeMenuBook.id}`); setActiveMenuBook(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-800 font-bold text-sm transition-colors"
              >
                <Headphones size={18} className="text-blue-500" />
                <span>Audio tinglash</span>
              </button>

              <button 
                onClick={() => handleShare(activeMenuBook)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-800 font-bold text-sm transition-colors"
              >
                <Share2 size={18} className="text-green-500" />
                <span>Havolani ulashish</span>
              </button>

              <button 
                onClick={() => handleRemove(activeMenuBook)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-600 font-bold text-sm transition-colors"
              >
                <Trash2 size={18} />
                <span>Saqlanganlardan o'chirish</span>
              </button>
            </div>

          </div>
        </div>
      )}

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
          <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-2 text-red-500 transition-colors">
            <Heart size={22} fill="currentColor" className="mb-1" />
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