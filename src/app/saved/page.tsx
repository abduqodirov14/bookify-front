"use client";

import React from "react";
import Link from "next/link";
import { BOOKS } from "@/data/books";
import { ArrowLeft, Heart, BookOpen, Clock, MoreVertical, User } from "lucide-react";

export default function SavedPage() {
  const savedBooks = BOOKS.slice(0, 3); // Just show a few for now

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Saqlanganlar</h1>
      </header>

      {/* Content */}
      <main className="p-6">
        {savedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBooks.map((book, i) => (
              <div key={book.id} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex gap-4 items-center group relative overflow-hidden transition-all hover:shadow-md cursor-pointer">
                <Link href={`/book/${book.id}`} className="absolute inset-0 z-10"></Link>
                <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                  <img src={book.coverImage || (i%2==0 ? "/images/books/ref2.png" : "/images/books/ref3.png")} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="inline-block px-2 py-0.5 bg-orange-50 text-orange-600 font-bold text-[10px] rounded-full mb-2 uppercase tracking-wide">Audio & Matn</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{book.title}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-3 truncate">{book.authorName}</p>
                  
                  <div className="flex items-center gap-3">
                    <button className="relative z-20 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                      <Heart size={16} fill="currentColor" />
                    </button>
                    <button className="relative z-20 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
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
            <p className="text-gray-500 text-sm max-w-xs">Yoqtirgan kitoblaringizni saqlab qo'ying, ularni istalgan vaqt shu yerdan topishingiz mumkin.</p>
            <Link href="/" className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full font-bold shadow-lg shadow-black/10 active:scale-95 transition-transform">
              Kitoblarni ko'rish
            </Link>
          </div>
        )}
      </main>
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
          <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-2 text-red-500 hover:text-red-600 transition-colors">
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