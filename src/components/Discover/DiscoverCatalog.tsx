import React, { useState } from 'react';
import { Book } from '../../types';
import { api } from '../../services/api';
import { Search, BookOpen, Headphones, BookmarkPlus, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  books: Book[];
  onOpenReader: (bookId: string) => void;
  onPlayAudio: (book: Book) => void;
}

export default function DiscoverCatalog({ books, onOpenReader, onPlayAudio }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');

  const categories = ["Barchasi", "Mumtoz Meros", "Tarixiy Romanlar", "Jadid Adabiyoti", "Falsafa & Ma'rifat", "Badiiy Adabiyot"];

  const filteredBooks = books.filter(b => {
    const matchCat = selectedCategory === 'Barchasi' || b.category === selectedCategory;
    const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        b.authorName.toLowerCase().includes(searchQuery.toLowerCase());
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
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                selectedCategory === c
                  ? 'bg-[#E05638] text-white font-bold shadow-xs'
                  : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
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
          {filteredBooks.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="book-card-3d">
                  <div className="book-card-inner relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-book border border-black/10">
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    <div className="book-spine-hinge" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#E05638] uppercase tracking-wider">
                    {b.category}
                  </span>
                  <h3 className="font-serif text-base font-bold text-stone-950 dark:text-white truncate group-hover:text-[#E05638] transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-stone-500 truncate">{b.authorName}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenReader(b.id)}
                    className="py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs hover:bg-[#E05638] dark:hover:bg-[#E05638] dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookOpen size={14} />
                    <span>Mutolaa</span>
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
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 text-center space-y-4 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center mx-auto shadow-xs">
            <Sparkles size={24} />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-950 dark:text-white">
            Katalogda kitoblar topilmadi
          </h3>
          <p className="text-xs text-stone-500">
            Hozircha bazada kitoblar mavjud emas yoki qidiruv so'rovi bo'yicha asar chiqmadi.
          </p>
        </div>
      )}

    </div>
  );
}
