'use client';

import React, { useState } from 'react';
import { Book, UserProfile } from '../../types';
import { api } from '../../services/api';
import { BOOK_CATEGORIES } from '../../data/categories';
import { Search, BookOpen, Headphones, BookmarkPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BookPaywallModal from '../Payment/BookPaywallModal';

interface Props {
  books: Book[];
  onOpenReader: (bookId: string) => void;
  onPlayAudio: (book: Book) => void;
  currentUser?: UserProfile | null;
  onBuyBook?: (book: Book) => void;
}

export default function DiscoverCatalog({ books, onOpenReader, onPlayAudio, currentUser, onBuyBook }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'premium' | 'free'>('all');
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
    const isPrem = Boolean((b as any).is_premium);
    const matchPricing = pricingFilter === 'all' 
      ? true 
      : pricingFilter === 'premium' 
        ? isPrem 
        : !isPrem;
    return matchCat && matchSearch && matchPricing;
  });

  const handleSaveToLibrary = async (book: Book) => {
    try {
      await api.addToLibrary(book.id);
      toast.success(`"${book.title}" javonga saqlandi`, { icon: '🔖' });
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleOpenBook = (b: Book) => {
    const isPrem = Boolean((b as any).is_premium);
    if (isPrem && !currentUser?.is_premium) {
      if (onBuyBook) {
        onBuyBook(b);
      } else {
        setPaywallBook(b);
      }
    } else {
      onOpenReader(b.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-300">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/10 dark:border-white/10 pb-6 pt-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink/50 dark:text-parchment/50 border border-black/10 dark:border-white/10 px-2 py-1 rounded-sm">
            Katalog
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink dark:text-parchment mt-4 tracking-tight">
            Jahon adabiyoti xazinasi
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-sm">
            <button
              onClick={() => setPricingFilter('all')}
              className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                pricingFilter === 'all'
                  ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink'
                  : 'text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment cursor-pointer'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setPricingFilter('premium')}
              className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                pricingFilter === 'premium'
                  ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink'
                  : 'text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment cursor-pointer'
              }`}
            >
              VIP
            </button>
            <button
              onClick={() => setPricingFilter('free')}
              className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                pricingFilter === 'free'
                  ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink'
                  : 'text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment cursor-pointer'
              }`}
            >
              Bepul
            </button>
          </div>
        </div>
      </div>

      {/* Strict Search & Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-parchment/40" />
          <input
            type="text"
            placeholder="Asar, muallif yoki janr..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-transparent border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-ink dark:focus:border-parchment transition-colors placeholder:text-ink/40 dark:placeholder:text-parchment/40"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:max-w-xl">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors cursor-pointer border ${
                selectedCategory === c
                  ? 'bg-ink dark:bg-parchment border-ink dark:border-parchment text-parchment dark:text-ink'
                  : 'bg-transparent border-black/10 dark:border-white/10 text-ink/60 dark:text-parchment/60 hover:border-ink dark:hover:border-parchment'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
          {filteredBooks.map(b => {
            const isPremium = !!(b as any).is_premium;
            const bookPrice = (b as any).price || 0;
            return (
              <div key={b.id} className="flex flex-col group relative">
                
                {/* Cover Image Container */}
                <div 
                  onClick={() => onOpenReader(b.id)}
                  className="aspect-[2/3] mb-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 relative overflow-hidden cursor-pointer"
                >
                  {isPremium && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-ink dark:bg-parchment text-parchment dark:text-ink text-[9px] font-bold font-mono tracking-widest z-10">
                      VIP
                    </div>
                  )}
                  {b.coverImage ? (
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full book-cover-placeholder" style={{ backgroundColor: b.spineColor }}>
                      <div className="bcp-title">{b.title}</div>
                      <div className="bcp-line"></div>
                      <div className="bcp-author">{b.authorName}</div>
                    </div>
                  )}
                  {/* Subtle Hover Overlay */}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 dark:group-hover:bg-parchment/5 transition-colors duration-300"></div>
                </div>

                {/* Info Text */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-ink/50 dark:text-parchment/50 uppercase tracking-[0.15em]">
                      {b.category}
                    </span>
                    {isPremium && bookPrice > 0 && (
                      <span className="text-[9px] font-mono text-ink/50 dark:text-parchment/50">
                        {new Intl.NumberFormat('uz-UZ').format(bookPrice)} so'm
                      </span>
                    )}
                  </div>
                  <h3 
                    onClick={() => onOpenReader(b.id)}
                    className="font-serif text-sm font-bold leading-tight group-hover:underline cursor-pointer line-clamp-2"
                  >
                    {b.title}
                  </h3>
                  <p className="text-[11px] font-mono text-ink/60 dark:text-parchment/60 uppercase tracking-widest mt-1">
                    {b.authorName}
                  </p>
                </div>

                {/* Minimal Actions Block */}
                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenBook(b)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer border flex items-center justify-center gap-2 ${
                        isPremium && !currentUser?.is_premium
                          ? 'bg-parchment dark:bg-ink border-ink dark:border-parchment text-ink dark:text-parchment'
                          : 'bg-ink dark:bg-parchment border-ink dark:border-parchment text-parchment dark:text-ink'
                      }`}
                    >
                      {isPremium && !currentUser?.is_premium ? 'VIP olish' : 'O\'qish'}
                    </button>
                    <button
                      onClick={() => onPlayAudio(b)}
                      className="px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Headphones size={14} className="text-ink/70 dark:text-parchment/70" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveToLibrary(b)}
                    className="w-full py-1.5 text-[10px] font-mono text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookmarkPlus size={12} /> Javonga saqlash
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 border border-black/10 dark:border-white/10 text-center space-y-4 max-w-lg mx-auto">
          <BookOpen size={24} className="mx-auto text-ink/40 dark:text-parchment/40" />
          <h3 className="font-serif text-xl font-bold">Katalogda natija yo'q</h3>
          <p className="text-sm font-mono text-ink/60 dark:text-parchment/60">
            Qidiruv so'rovini o'zgartirib qayta urinib ko'ring.
          </p>
        </div>
      )}

      {paywallBook && (
        <BookPaywallModal
          book={{
            id: paywallBook.id,
            title: paywallBook.title,
            author: paywallBook.authorName || (paywallBook as any).author,
            cover_url: paywallBook.coverImage || (paywallBook as any).cover_image,
            price: (paywallBook as any).price || 15000,
            is_premium: true,
          }}
          initialTab="book"
          isAdmin={currentUser?.role === 'ADMIN'}
          onClose={() => setPaywallBook(null)}
          onRequireAuth={() => toast.error("To'lov qilish uchun avval profilingizga kiring")}
          onAccessGranted={() => {
            const bId = paywallBook.id;
            setPaywallBook(null);
            onOpenReader(bId);
          }}
        />
      )}
    </div>
  );
}