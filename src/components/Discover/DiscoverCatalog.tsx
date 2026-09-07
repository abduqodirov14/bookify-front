'use client';

import React, { useState } from 'react';
import { Book } from '../../types';
import { api } from '../../services/api';
import { BOOK_CATEGORIES } from '../../data/categories';
import { Search, BookOpen, Headphones, BookmarkPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BookPaywallModal from '../Payment/BookPaywallModal';

interface Props {
  books: Book[];
  onOpenReader: (bookId: string) => void;
  onPlayAudio: (book: Book) => void;
}

export default function DiscoverCatalog({ books, onOpenReader, onPlayAudio }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [paywallBook, setPaywallBook] = useState<Book | null>(null);

  const categories = ["Barchasi", ...BOOK_CATEGORIES];

  const filteredBooks = books.filter(b => {
    let matchCat = selectedCategory === 'Barchasi';
    if (!matchCat && b.category) {
      const bCat = b.category.toLowerCase();
      const sCat = selectedCategory.toLowerCase();
      matchCat = bCat === sCat || bCat.includes(sCat) || sCat.includes(bCat);
    }
    const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        b.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleSaveToLibrary = async (book: Book) => {
    try {
      await api.addToLibrary(book.id);
      toast.success(`"${book.title}" shaxsiy javoningizga saqlandi!`, { icon: '🔖' });
    } catch {
      toast.error("Javonga saqlashda xatolik yuz berdi");
    }
  };

  const handleOpenBook = (b: Book) => {
    if ((b as any).is_premium) {
      setPaywallBook(b);
    } else {
      onOpenReader(b.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#E05638] font-bold">
            Kutubxona Xazinasi
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white mt-1">
            Durdona Asarlar Katalogi
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            PostgreSQL bazasidagi sara milliy asarlar va audio spektakllar
          </p>
        </div>

        <span className="px-4 py-2 rounded-2xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 text-xs font-mono font-bold text-stone-700 dark:text-stone-300 self-start sm:self-auto shadow-xs">
          Mavjud: {filteredBooks.length} ta asar
        </span>
      </div>

      {/* Search & Category Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Asar nomi yoki muallif..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#121620] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 max-w-full scrollbar-thin">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c
                  ? 'bg-[#E05638] text-white shadow-xs'
                  : 'bg-white dark:bg-[#121620] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-white/10 hover:border-[#E05638]/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid or Empty State */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(b => {
            const isPremium = !!(b as any).is_premium;
            const bookPrice = (b as any).price || 0;
            return (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
                style={isPremium ? { borderColor: 'rgba(247,151,30,0.3)' } : {}}
              >
                <div className="space-y-3">
                  {/* Cover */}
                  <div className="book-card-3d">
                    <div className="book-card-inner relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-book border border-black/10">
                      <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                      <div className="book-spine-hinge" />
                      {/* 💎 PREMIUM overlay badge */}
                      {isPremium && (
                        <div
                          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #f7971e, #ffd200)',
                            color: '#000',
                            boxShadow: '0 2px 8px rgba(247,151,30,0.5)'
                          }}
                        >
                          💎 PREMIUM
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-[#E05638] uppercase tracking-wider">
                        {b.category}
                      </span>
                      {isPremium && bookPrice > 0 && (
                        <span
                          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: 'rgba(247,151,30,0.12)', color: '#f7971e' }}
                        >
                          {new Intl.NumberFormat('uz-UZ').format(bookPrice)} so'm
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-950 dark:text-white truncate group-hover:text-[#E05638] transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-xs text-stone-500 truncate">{b.authorName}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-white/5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenBook(b)}
                      className={`py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        isPremium
                          ? 'text-black hover:opacity-90'
                          : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-[#E05638] dark:hover:bg-[#E05638] dark:hover:text-white'
                      }`}
                      style={isPremium ? { background: 'linear-gradient(135deg, #f7971e, #ffd200)' } : {}}
                    >
                      {isPremium ? <span>💎</span> : <BookOpen size={14} />}
                      <span>{isPremium ? "Sotib Ol" : "Mutolaa"}</span>
                    </button>

                    <button
                      onClick={() => onPlayAudio(b)}
                      className="py-2.5 rounded-xl bg-[#E05638]/10 text-[#E05638] hover:bg-[#E05638] hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Headphones size={14} />
                      <span>Tinglash</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleSaveToLibrary(b)}
                    className="w-full py-2 rounded-xl bg-stone-50 dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 font-medium text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookmarkPlus size={13} className="text-[#E05638]" />
                    <span>Javonga Saqlash</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 text-center space-y-4 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center mx-auto shadow-xs">
            <BookOpen size={24} />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-950 dark:text-white">
            Katalogda Kitoblar Topilmadi
          </h3>
          <p className="text-xs text-stone-500">
            Qidiruv so'rovi bo'yicha mos keladigan asarlar topilmadi yoki filtrlar o'zgartirilishi lozim.
          </p>
        </div>
      )}

      {/* Paywall Modal */}
      {paywallBook && (
        <BookPaywallModal
          book={{
            id: Number(paywallBook.id),
            title: paywallBook.title,
            author: paywallBook.authorName,
            cover_url: paywallBook.coverImage,
            price: (paywallBook as any).price,
            is_premium: (paywallBook as any).is_premium,
          }}
          onClose={() => setPaywallBook(null)}
          onAccessGranted={() => {
            setPaywallBook(null);
            onOpenReader(paywallBook.id);
          }}
        />
      )}

    </div>
  );
}
