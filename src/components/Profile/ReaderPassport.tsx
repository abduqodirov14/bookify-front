import React, { useState } from 'react';
import { UserProfile, Book } from '../../types';
import { Award, BookOpen, Clock, Heart, Sparkles, LogOut, ShieldCheck, Bookmark as BookmarkIcon, ChevronRight } from 'lucide-react';

interface Props {
  user: UserProfile;
  books: Book[];
  onOpenReader: (bookId: string) => void;
  onLogout: () => void;
}

export default function ReaderPassport({ user, books, onOpenReader, onLogout }: Props) {
  const [shelfMode, setShelfMode] = useState<'cover' | 'spine'>('cover');

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in duration-300">
      
      {/* ── Ex Libris / Reader Passport Header ── */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#E05638] to-[#C5A059] flex items-center justify-center text-white font-serif font-bold text-3xl shadow-xl ring-4 ring-[#C5A059]/20">
              {user.name[0]}
            </div>
            
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                  EX LIBRIS • NO. 042-UZ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> 2FA Himoyalangan
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white">
                {user.name}
              </h1>
              <p className="font-serif italic text-xs sm:text-sm text-stone-500 max-w-lg">
                "Kitob — insoniyat aql-zakovati va qalbining asrlar oshib kelayotgan eng buyuk siri..."
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-mono font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <LogOut size={15} />
            <span>Tizimdan Chiqish</span>
          </button>

        </div>
      </div>

      {/* ── Concentric Stats & Reading Habits ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase">Bugungi Mutolaa</span>
          <div className="text-3xl font-bold text-stone-950 dark:text-white font-mono">
            {user.todayMinutes} <span className="text-xs font-sans text-stone-400">daqiqa</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block">
            Me'yor: {user.dailyGoalMinutes} daqiqa (100% bajarildi)
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase">O'qish Seriyasi</span>
          <div className="text-3xl font-bold text-[#E05638] font-mono">
            {user.readingStreakDays} <span className="text-xs font-sans text-stone-400">kun uzluksiz</span>
          </div>
          <span className="text-[11px] text-stone-400 block">
            🔥 Oltin marafon ishtirokchisi
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase">Jami Mutolaa Vaqti</span>
          <div className="text-3xl font-bold text-stone-950 dark:text-white font-mono">
            {user.totalHours} <span className="text-xs font-sans text-stone-400">soat</span>
          </div>
          <span className="text-[11px] text-stone-400 block">
            Audio va matnli mutolaa
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase">O'qilgan Asarlar</span>
          <div className="text-3xl font-bold text-[#C5A059] font-mono">
            {user.finishedBooksCount} <span className="text-xs font-sans text-stone-400">ta durdona</span>
          </div>
          <span className="text-[11px] text-stone-400 block">
            Shaxsiy javonda saqlangan
          </span>
        </div>
      </div>

      {/* ── Physical Bookshelf (Cover vs Spine View) ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
              Shaxsiy Kitob Javoni
            </h3>
            <p className="text-xs text-stone-500">Mutolaa qilinayotgan va tugatilgan durdona kitoblar</p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-white/10">
            <button
              onClick={() => setShelfMode('cover')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                shelfMode === 'cover' ? 'bg-white dark:bg-stone-800 text-[#E05638] font-bold shadow-xs' : 'text-stone-500'
              }`}
            >
              Muqova Ko'rinishi
            </button>
            <button
              onClick={() => setShelfMode('spine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                shelfMode === 'spine' ? 'bg-white dark:bg-stone-800 text-[#E05638] font-bold shadow-xs' : 'text-stone-500'
              }`}
            >
              Jild Ko'rinishi (Spine)
            </button>
          </div>
        </div>

        {shelfMode === 'cover' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {books.slice(0, 6).map(b => (
              <div
                key={b.id}
                onClick={() => onOpenReader(b.id)}
                className="group cursor-pointer space-y-2.5"
              >
                <div className="book-card-3d">
                  <div className="book-card-inner relative aspect-[2/3] rounded-2xl overflow-hidden shadow-book border border-black/10">
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    <div className="book-spine-hinge" />
                  </div>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate group-hover:text-[#E05638]">
                    {b.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 truncate block">{b.authorName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Realistic Physical Shelf Spine Mode */
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#2A1E14] via-[#3E2D1F] to-[#2A1E14] border-8 border-[#1A120B] shadow-2xl flex items-end justify-center gap-3 h-72 overflow-x-auto">
            {books.slice(0, 8).map((b, idx) => (
              <div
                key={b.id}
                onClick={() => onOpenReader(b.id)}
                className="w-12 sm:w-14 rounded-t-md cursor-pointer hover:-translate-y-4 transition-transform duration-300 shadow-xl flex flex-col justify-between p-2 text-center text-white border-l border-white/20 select-none group"
                style={{
                  height: `${200 + (idx % 3) * 20}px`,
                  backgroundColor: b.spineColor
                }}
              >
                <span className="text-[8px] font-mono opacity-60">FIANNY</span>
                <span className="text-[10px] font-serif font-bold writing-vertical rotate-180 truncate my-auto tracking-wider">
                  {b.title}
                </span>
                <span className="text-[8px] font-mono text-[#C5A059]">★ {b.rating}</span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
