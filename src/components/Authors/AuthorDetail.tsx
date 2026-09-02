import React, { useState } from 'react';
import { Author, Book } from '../../types';
import { BookOpen, Headphones, Quote, Sparkles, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  author: Author;
  books: Book[];
  allAuthors: Author[];
  onSelectAuthor: (authorId: string) => void;
  onOpenReader: (bookId: string) => void;
  onPlayAudio: (book: Book) => void;
  onBack: () => void;
}

export default function AuthorDetail({
  author,
  books,
  allAuthors,
  onSelectAuthor,
  onOpenReader,
  onPlayAudio,
  onBack
}: Props) {
  const [filterFormat, setFilterFormat] = useState<'all' | 'audio' | 'text'>('all');
  const authorBooks = books.filter(b => b.authorId === author.id);
  const otherAuthors = allAuthors.filter(a => a.id !== author.id);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-300">
      
      {/* ── Author Hero Exhibition Canvas ── */}
      <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-b from-[#FAF6EE] to-white dark:from-[#121620] dark:to-[#0A0D14] border border-stone-200/90 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 dark:bg-[#E05638]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
          
          {/* Historical Portrait with Double Gold Ring */}
          <div className="relative shrink-0">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#1E293B] ring-2 ring-[#C5A059]/40 group">
              <img
                src={author.portrait}
                alt={author.name}
                className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#C5A059] text-stone-950 text-[10px] font-mono font-bold tracking-wider uppercase shadow-md whitespace-nowrap">
              {author.lifetime}
            </div>
          </div>

          {/* Biography & Signature Quote */}
          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E05638]/10 text-[#E05638] dark:text-amber-400 border border-[#E05638]/20">
                {author.movement}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                {authorBooks.length} ta Durdona Asar
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-950 dark:text-white tracking-tight">
              {author.name}
            </h1>

            {/* Signature Quote */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 relative">
              <Quote size={24} className="absolute top-3 left-3 text-[#C5A059]/30 pointer-events-none" />
              <p className="font-serif italic text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed pl-6">
                "{author.quote}"
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-3xl">
              {author.bio}
            </p>
          </div>

        </div>
      </div>

      {/* ── Author's Books Shelf ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
              {author.name} Asarlari Xazinasi
            </h3>
            <p className="text-xs text-stone-500">Mutolaa qilish va professional audio spektaklni tinglash uchun asarni tanlang</p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-white/10">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'text', label: '📖 Matnli' },
              { id: 'audio', label: '🎧 Audio Spektakl' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterFormat(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  filterFormat === tab.id
                    ? 'bg-white dark:bg-stone-800 text-[#E05638] dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Hardcover Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {authorBooks.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex gap-4">
                {/* 3D Hardcover Cover */}
                <div className="book-card-3d shrink-0">
                  <div className="book-card-inner relative w-24 h-34 rounded-xl overflow-hidden shadow-book border border-black/10">
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    <div className="book-spine-hinge" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#E05638] uppercase tracking-wider">
                      {b.category}
                    </span>
                    <h4 className="font-serif text-base font-bold text-stone-950 dark:text-white truncate group-hover:text-[#E05638] transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400 pt-2">
                    <span>📖 {b.pages} bet</span>
                    <span>🎧 {b.audioDuration}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-white/5">
                <button
                  onClick={() => onOpenReader(b.id)}
                  className="py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs transition-colors cursor-pointer hover:bg-[#E05638] dark:hover:bg-[#E05638] dark:hover:text-white flex items-center justify-center gap-1.5"
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

            </div>
          ))}
        </div>
      </div>

      {/* ── Other Masters Carousel ── */}
      <div className="space-y-4 pt-6 border-t border-stone-200 dark:border-white/10">
        <h4 className="font-serif text-lg font-bold text-stone-950 dark:text-white">
          Boshqa Buyuk Allomalar Merosi
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {otherAuthors.map(a => (
            <div
              key={a.id}
              onClick={() => onSelectAuthor(a.id)}
              className="p-4 rounded-2xl bg-white dark:bg-[#121620] border border-stone-200/80 dark:border-white/10 hover:border-[#E05638] cursor-pointer text-center space-y-2 group transition-all"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto shadow-md border-2 border-white dark:border-stone-700 group-hover:scale-105 transition-transform">
                <img src={a.portrait} alt={a.name} className="w-full h-full object-cover grayscale" />
              </div>
              <h5 className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate group-hover:text-[#E05638]">
                {a.name}
              </h5>
              <span className="text-[10px] font-mono text-stone-400 block">{a.lifetime}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
