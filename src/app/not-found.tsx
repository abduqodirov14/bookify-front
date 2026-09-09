'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#FAF6EE] dark:bg-[#080B0F] text-stone-800 dark:text-stone-100 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden font-sans select-none transition-colors duration-300">
      
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#E05638]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Clean Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Bookify Emblem / Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#E05638]/10 dark:bg-[#E05638]/15 text-[#E05638] shadow-inner mb-2">
          <BookOpen size={40} strokeWidth={1.75} />
        </div>

        {/* 404 Number in Serif */}
        <div className="space-y-1">
          <span className="font-serif text-6xl sm:text-7xl font-black tracking-tight text-[#E05638]">
            404
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
            Sahifa Topilmadi
          </h1>
        </div>

        {/* Literary Message */}
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
          Siz qidirayotgan sahifa yoki kitob mavjud emas, nomi o'zgargan yoki boshqa adabiy bo'limga ko'chirilgan bo'lishi mumkin.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#E05638] hover:bg-[#c94427] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#E05638]/25 cursor-pointer active:scale-95"
          >
            <Home size={17} />
            <span>Bosh Sahifaga Qaytish</span>
          </Link>

          <Link
            href="/?view=discover"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-stone-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-stone-200 dark:border-white/10 cursor-pointer active:scale-95"
          >
            <Compass size={17} />
            <span>Katalogga O'tish</span>
          </Link>
        </div>

        {/* Subtle Footer Brand */}
        <div className="pt-4 border-t border-stone-100 dark:border-white/5 text-xs text-stone-400 dark:text-stone-500 font-medium">
          Bookify • Milliy Raqamli Kutubxona
        </div>

      </div>
    </div>
  );
}
