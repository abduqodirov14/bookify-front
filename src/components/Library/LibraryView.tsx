import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { api } from '../../services/api';
import { BookOpen, BookmarkCheck, Trash2, Headphones } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  allBooks: Book[];
  onOpenReader: (bookId: string) => void;
  onPlayAudio: (book: Book) => void;
  onGoToDiscover: () => void;
}

export default function LibraryView({ allBooks, onOpenReader, onPlayAudio, onGoToDiscover }: Props) {
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const items = await api.getLibrary();
      if (Array.isArray(items)) {
        // Items might be book objects or ID strings
        const ids = items.map((it: any) => typeof it === 'string' ? it : String(it.id || it.book_id));
        setSavedBookIds(ids);
      }
    } catch (e) {
      console.error("Library fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleRemove = async (bookId: string) => {
    await api.removeFromLibrary(bookId);
    setSavedBookIds(prev => prev.filter(id => id !== bookId));
    toast.success("Asar shaxsiy javoningizdan olib tashlandi");
  };

  const savedBooks = allBooks.filter(b => savedBookIds.includes(b.id));

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-28 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E05638] uppercase tracking-wider mb-1">
            <BookmarkCheck size={16} />
            <span>Shaxsiy Javonim</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white">
            Saqlangan Asarlar Xazinasi
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Siz saqlagan, o'qiyotgan va kelgusida mutolaa qilmoqchi bo'lgan asarlaringiz
          </p>
        </div>

        <span className="px-4 py-2 rounded-2xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 text-xs font-mono font-bold text-stone-700 dark:text-stone-300 self-start sm:self-auto shadow-xs">
          Jami: {savedBooks.length} ta asar
        </span>
      </div>

      {/* Books Grid or Empty State */}
      {savedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedBooks.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex gap-4">
                <div className="book-card-3d shrink-0">
                  <div className="book-card-inner relative w-24 h-34 rounded-xl overflow-hidden shadow-book border border-black/10">
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    <div className="book-spine-hinge" />
                  </div>
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#E05638] uppercase tracking-wider">
                      {b.category}
                    </span>
                    <h4 className="font-serif text-base font-bold text-stone-950 dark:text-white truncate group-hover:text-[#E05638] transition-colors">
                      {b.title}
                    </h4>
                    <span className="text-xs text-stone-500 font-medium block truncate">
                      {b.authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400 pt-2">
                    <span>📖 {b.pages} bet</span>
                    <span>🎧 {b.audioDuration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-white/5">
                <button
                  onClick={() => onOpenReader(b.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#E05638] hover:bg-[#C74326] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <BookOpen size={14} />
                  <span>Mutolaani Davom Ettirish</span>
                </button>

                <button
                  onClick={() => onPlayAudio(b)}
                  className="p-2.5 rounded-xl bg-[#E05638]/10 text-[#E05638] hover:bg-[#E05638] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                  title="Audio Tinglash"
                >
                  <Headphones size={14} />
                </button>

                <button
                  onClick={() => handleRemove(b.id)}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-white/5 text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Javondant chiqarish"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 text-center space-y-6 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center mx-auto shadow-md">
            <BookmarkCheck size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
              Shaxsiy javoningiz hozircha bo'sh
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Katalogdagi sara durdona asarlardan istalganini "Javonga saqlash" tugmasi orqali shaxsiy mutolaa ro'yxatingizga qo'shib olishingiz mumkin.
            </p>
          </div>
          <button
            onClick={onGoToDiscover}
            className="px-8 py-4 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-xl cursor-pointer inline-flex items-center gap-2"
          >
            <BookOpen size={15} />
            <span>Katalogdan Asar Tanlash</span>
          </button>
        </div>
      )}

    </div>
  );
}
